import React from 'react';
import { Link } from 'react-router-dom';

export const NoMatch = () => {
    return (
        <div>
            <h2>404 Page not found</h2>
            Naviagate to <Link to="/">Home </Link>page
        </div>
    )
}
