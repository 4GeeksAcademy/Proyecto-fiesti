import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Reset() {
    const token = new URLSearchParams(location.search).get("token")
    console.log(token);

    return (
        <div>Reset</div>
    )
}

