import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PaginaInicial from "./partial/pages/js/PaginaInicial"
import Quiz from "./partial/pages/js/PaginaQuiz";

class App extends React.Component { 
  render() {
    return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={ <PaginaInicial /> } />
            <Route path="/quiz" element={<Quiz />} />
          </Routes>
        </BrowserRouter>
      </>
    );
  }
}

export default App;

// export default class App extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       loading: false,
//       selected: 0,
//       avatarType: 0,
//       imgs: [

//       ]
//     }
//     this.onImgClick = this.onImgClick.bind(this)
//     this.onLoadImage = this.onLoadImage.bind(this)
//   }
//   onImgClick(e) {
//     console.log(e)
//   }
//   onLoadImage(e) {
//     setTimeout(() => {
//       console.log("height", e.target.height)
//       console.log("width", e.target.width)
//     }, 3000)
//   }

//   getImgs() {
//     fetch('http://localhost:8080/animal/3/imagens')
//       .then(response => {
//         response.json()
//         .then(data => {
//           let imgs = data.map(i => i.caminho)
//           this.setState({imgs})
//         })
//         this.setState({ loading: false })
//       })
//       .catch(response => {
//         console.log(response)
//         this.setState({ loading: false })
//       });
//   }

//   componentWillUnmount() {
//     this.getImgs()
//   }

//   render() {
//     return <div className="container">
//       <div className={this.state.loading ? "row" : "d-none"}>
//         <div className="col-12">
//           <p className="text-center">
//             <i className="fa-solid fa-2x fa-spinner fa-spin"></i>
//           </p>
//         </div>
//       </div>
//       <div className={!this.state.loading ? "row py-5" : "d-none"}>
//         <div className="col-md-6 col-xs-12 col-lg-6">
//           <img
//             alt='text'
//             style={{
//               cursor: 'pointer'
//             }}
//             onLoad={this.onLoadImage}
//             onClick={this.onImgClick} className="img-fluid" src={this.state.imgs[0]} />
//         </div>
//         <div className="col-md-6 col-xs-12 col-lg-6">
//           <img alt='text 2' className="img-fluid" src={this.state.imgs[1]} />
//         </div>
//       </div>
//       <button onClick={() => this.getImgs()}>asda</button>
//     </div>
//   }
// }
