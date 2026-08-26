# 06 – Armazenamento de Arquivos (Imagens)

## 1. Como funciona hoje

**Fluxo upload:** `ImagemJanelaController.cadastrar:84` (`POST /animal/{idAnimal}/imagens` multipart)

```java
// ImagemJanelaController.java:35-43
List<String> AREAS = Arrays.asList("hd", "hr", "er", "cc");
String pastaArquivos = obterCaminhoPastaArquivos();

public String obterCaminhoPastaArquivos() {
  ClassPathResource resource = new ClassPathResource("arquivos/");
  String path = resource.getPath(); // ex: /app/target/classes/arquivos/
  return path;
}

// ImagemJanelaController.java:102-108
String caminho = "animal_" + animal.getId() + "_" + AREAS.get(janela) + ".png";
Path path = Paths.get(obterCaminhoPastaArquivos() + caminho);
Files.write(path, bytes);
```

**Fluxo leitura:** `ImagemJanelaController.carregaImagensDinamicas:182`

```java
@GetMapping(value="/ws/images/{urlImagemLocal}", produces=IMAGE_JPEG_VALUE)
public byte[] carregaImagensDinamicas(@PathVariable String nomeImagem) {
  File f = new File(obterCaminhoPastaArquivos() + nomeImagem);
  return Files.readAllBytes(f.toPath());
}
```

**Update:** `ImagemJanelaController.atualizar:122` deleta antigo `Files.delete(pastaArquivos + imagem.getCaminho())` e escreve novo.

**Delete:** `ImagemJanelaController.deletar:162` `Files.delete(...)` + `repository.deleteById`.

**Local físico:** `src/main/resources/arquivos/` contém 8 PNGs seed (`animal_12_hd.png` etc.) e `inserts.sql`. Em runtime, `ClassPathResource("arquivos/")` resolve para `target/classes/arquivos/` (dentro do jar) ou `src/main/resources/arquivos/` em `mvn spring-boot:run` com `docker-compose.override.yml:4` volume `.:/app`.

## 2. Problemas críticos

| # | Problema | Arquivo:linha | Impacto |
|---|----------|---------------|---------|
| F01 | Classpath como storage mutável | `ImagemJanelaController.java:35` `ClassPathResource` | Em jar, `target/classes` é read-only; `Files.write` falha em prod jar (`Dockerfile:2` `java -jar`). Em container, writes vão para camada efêmera e somem em restart/redeploy. |
| F02 | Sem validação `janela` index | `AREAS.get(janela)` sem bounds check | `janela=5` → `IndexOutOfBoundsException` 500 |
| F03 | `Files.delete` sem try específico | `atualizar:135` `catch(Exception e){}` vazio, `deletar:165` sem try | Falha silenciosa, DB e FS ficam inconsistentes |
| F04 | Path traversal | `carregaImagensDinamicas:182` `new File(pasta + nomeImagem)` | `GET /ws/images/../../application.yaml` vaza config (se pasta for `src/main/resources`) |
| F05 | Nome colisão | `caminho = "animal_"+id+"_"+AREAS.get(janela)+".png"` | Só 1 imagem por janela por animal; upload sobrescreve sem checar `findByAnimalId` duplicado |
| F06 | `produces=IMAGE_JPEG_VALUE` para PNG | `ImagemJanelaController.java:182` | Browser pode não renderizar PNG com header JPEG |
| F07 | Sem `Content-Disposition`, cache, ETag | `carregaImagensDinamicas` retorna `byte[]` puro | Sem cache, sem 304, sem range |
| F08 | `Files.write` sem `CREATE`/`TRUNCATE` explícito | `cadastrar:108` | Se arquivo existe, sobrescreve mas sem log |
| F09 | `application.yaml:26` `max-file-size 20MB` sem validação tipo | – | Aceita qualquer `MultipartFile`, não só PNG |

## 3. Exemplo de falha em produção

```bash
# Build jar
mvn package -DskipTests
java -jar target/simulator.afast-0.0.1-SNAPSHOT.jar
# POST /animal/1/imagens com file → try Files.write(ClassPathResource("arquivos/").getPath() + "animal_1_hd.png")
# ClassPathResource.getPath() = "arquivos/" (dentro do jar, não é diretório real) → NoSuchFileException
# Log: System.out.println(e) em cadastrar:116, retorna 400 "Arquivo não Encontrado"
```

Com `docker-compose.override.yml` funciona local porque `.:/app` monta código fonte e `ClassPathResource` resolve para filesystem real.

## 4. Abstração proposta

Criar interface para desacoplar:

```java
// storage/StorageService.java (novo)
public interface StorageService {
  String store(Long animalId, int janela, MultipartFile file) throws IOException;
  byte[] load(String caminho) throws IOException;
  void delete(String caminho) throws IOException;
  String getPublicUrl(String caminho);
}

// storage/LocalStorageService.java (implementação atual, p/ dev)
@Service @Profile("dev")
public class LocalStorageService implements StorageService {
  @Value("${storage.local.path:./uploads/}") String basePath;
  public String store(...) { /* Files.write(Paths.get(basePath, caminho)) */ }
  public byte[] load(...) { /* Files.readAllBytes */ }
}

// storage/S3StorageService.java (futuro para prod, se necessário)
@Service @Profile("prod")
public class S3StorageService implements StorageService {
  // s3Client.putObject(bucket, caminho, file)
}
```

**Refator em `ImagemJanelaController`:**

```java
@Autowired StorageService storage;
caminho = storage.store(idAnimal, janela, file);
// ...
byte[] img = storage.load(nomeImagem);
return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(img);
```

Migrar `application.yaml`:

```yaml
storage:
  type: ${STORAGE_TYPE:local} # local | s3
  local:
    path: ${STORAGE_PATH:./uploads/}
```

Mover `src/main/resources/arquivos/*.png` para `uploads/` fora do classpath e ignorar em `.gitignore`.

## 5. Checklist file storage

- [ ] Validar `janela` entre 0 e 3, `file` content-type `image/png|jpeg`, `file` não vazio.
- [ ] Sanitizar `nomeImagem` regex `^animal_\d+_(hd|hr|er|cc)\.png$`.
- [ ] Mover storage para fora do classpath (`./uploads/`).
- [ ] Implementar `StorageService` interface.
- [ ] Add `Cache-Control: public, max-age=31536000` em `GET /ws/images`.
- [ ] Trocar `produces=IMAGE_JPEG_VALUE` → `IMAGE_PNG_VALUE` ou `APPLICATION_OCTET_STREAM`.
- [ ] Logar `IOException` com `logger.error` em vez de `System.out.println`.

---
*Fontes: `controllers/ImagemJanelaController.java:1`, `src/main/resources/arquivos/` (8 PNGs), `application.yaml:22`, `pojos/ImagemPOJO.java:1`*
