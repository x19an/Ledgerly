<<<<<<< HEAD
=======

>>>>>>> b462a0c3e1989d82e4e235195ce17108cf6ef656
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
<<<<<<< HEAD
);
=======
);
>>>>>>> b462a0c3e1989d82e4e235195ce17108cf6ef656
