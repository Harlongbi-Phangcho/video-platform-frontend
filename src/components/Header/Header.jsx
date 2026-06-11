import React from 'react'
import { Link } from "react-router-dom";

function Header() {
  return (
  // create header along with logo and navigation links
    <header className="border-b px-6 py-4">
      <div className='flex items-center justify-between'>
        <Link to="/">
        <h1 className='text-xl font-bold'>MyTube</h1>
        </Link>
        <nav>
          <ul className='flex space-x-4'>
            <li>
              <Link to="/login" className='text-gray-600 hover:text-gray-800'>Login</Link>
            </li>
            <li>
              <Link to="/register" className='text-gray-600 hover:text-gray-800'>Register</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    
  )
}

export default Header