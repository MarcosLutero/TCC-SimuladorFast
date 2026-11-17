import React from 'react'

const Logout = (props) => {
   return <li className='nav-item'>
      <button
         type='button'
         className='nav-link btn btn-link'
         style={{ fontFamily: 'inherit' }}
         onClick={() => {
            sessionStorage.clear()
            window.location.href = '/login'
         }}
      >
         Sair
      </button>
   </li>
}

export default Logout