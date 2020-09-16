import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import Home from "./pages/Home";
import Board from "./pages/Board";
import Socket from "./pages/Socket";

function App() {
  return (
    <div>
      <Router>
        <main>
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/board/:id" exact component={Board} />
            <Route path="/class/:id" exact component={Socket} />
            <Redirect to="/" />
          </Switch>
        </main>
      </Router>
    </div>
  );
}

export default App;
