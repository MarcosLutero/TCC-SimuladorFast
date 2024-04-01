import React from 'react'

const Logout = (props) => {
   return <li className='nav-item'>
      <a
         className='nav-link'
         href='#'
         onClick={e => {
            e.preventDefault()
            sessionStorage.clear()
            window.location.href = '/login'
         }}
      >
         Sair
      </a>
   </li>
}

export default Logout