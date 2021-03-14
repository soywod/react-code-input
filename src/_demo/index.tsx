import React, {FC, useRef, useState} from "react";
import ReactDOM from "react-dom";
import cn from "classnames";

import PinField from "..";

const App: FC = () => {
  const [demoCompleted, setDemoCompleted] = useState(false);
  const [code, setCode] = useState("");
  const [completed, setCompleted] = useState(false);
  const ref = useRef<HTMLInputElement[]>([]);

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="/">
          React PIN Field
        </a>
        <ul className="navbar-nav mr-auto" />
        <ul className="navbar-nav">
          <li className="nav-item active">
            <a
              className="nav-link"
              href="https://github.com/soywod/react-pin-field"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </li>
        </ul>
      </nav>

      <div className="jumbotron pb-3">
        <div className="container text-center">
          <h1 className="display-3">📟 React PIN Field</h1>
          <p className="lead">A React component for entering PIN codes.</p>
          <div className="mb-4">
            <a className="mr-2" href="https://travis-ci.org/soywod/react-pin-field">
              <img src="https://travis-ci.org/soywod/react-pin-field.svg?branch=master" alt="" />
            </a>
            <a className="mr-2" href="https://codecov.io/gh/soywod/react-pin-field">
              <img src="https://codecov.io/gh/soywod/react-pin-field/branch/master/graph/badge.svg" alt="" />
            </a>
            <a className="mr-2" href="https://www.npmjs.com/package/react-pin-field">
              <img src="https://img.shields.io/npm/v/react-pin-field?label=npm" alt="" />
            </a>
            <kbd>$ yarn add react-pin-field</kbd>
          </div>
          <div className="pin-field-container">
            <PinField
              className={cn("pin-field", {complete: demoCompleted})}
              onComplete={() => setDemoCompleted(true)}
              format={k => k.toUpperCase()}
              autoFocus
              disabled={demoCompleted}
            />
          </div>
        </div>
      </div>

      <div className="container mb-5">
        <h2 className="display-5 mb-4">Default</h2>
        <div>
          <PinField data-cy="pin-field" />
        </div>

        <h2 className="display-5 mt-4">With ref</h2>
        <p className="mb-4 text-muted">You can control each input with the pin field ref:</p>
        <div>
          <PinField ref={ref} />
        </div>
        <div>
          <button onClick={() => ref && ref.current && ref.current[1].focus()}>Focus 2nd input</button>
          <button onClick={() => ref && ref.current && ref.current.forEach(input => (input.value = ""))}>
            Reset values
          </button>
        </div>

        <h2 className="display-5 mt-5">With custom style</h2>
        <p className="mb-4 text-muted">
          The attributes <code>className</code> and <code>style</code> are transmitted to all inputs. You can also use
          pseudo-classes
          <code>:valid</code>, <code>:invalid</code>, <code>:focus</code>, <code>:hover</code>…
        </p>
        <div>
          <PinField className="pin-field" />
        </div>

        <h2 className="display-5 mt-5">With custom length</h2>
        <p className="mb-4 text-muted">You can set the number of chars with the length attribute.</p>
        <div>
          <PinField className="pin-field" length={3} />
        </div>

        <h2 className="display-5 mt-5">With custom validation</h2>
        <p className="mb-4 text-muted">
          You can restrict input with a string of allowed chars, a regex, or a function.
        </p>
        <p>Only numbers:</p>
        <div>
          <PinField className="pin-field" validate="0123456789" inputMode="numeric" />
        </div>

        <h2 className="display-5 mt-5">With custom events</h2>
        <ul className="mb-4 text-muted">
          <li>onChange: when the code changes</li>
          <li>onComplete: when the code has been fully filled</li>
          <li>onResolveKey: when receiving a good key</li>
          <li>onRejectKey: when receiving a bad key</li>
        </ul>
        <div>
          <PinField
            className="pin-field"
            onChange={setCode}
            onComplete={() => setCompleted(true)}
            format={k => k.toUpperCase()}
          />
        </div>
        <div>Current code: {code}</div>
        <div>Completed: {String(completed)}</div>

        <h2 className="display-5 mt-5">With custom InputHTMLAttributes</h2>
        <p className="mb-4 text-muted">Props inherit from InputHTMLAttributes. For eg. with a password type prop:</p>
        <div>
          <PinField className="pin-field" type="password" />
        </div>
      </div>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
