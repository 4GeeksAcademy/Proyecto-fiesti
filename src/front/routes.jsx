// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Perfil } from "./pages/Perfil";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Personal from "./pages/Personal";
import CrearActuacion from "./pages/CrearActuacion";
import ActuacionesList from "./pages/ActuacionesList";
import FestiActual from "./pages/FestiActual";
import Reset from "./pages/Reset";





export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* PÚBLICAS */}
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/personal" element={<Personal />} />
      <Route path="/actuaciones/nueva" element={<CrearActuacion />} />
      <Route path="/festi" element={<FestiActual />} />
      <Route path="/reset_password" element={<Reset />} />
      <Route path="/single/:theId" element={<Single />} />

      {/* PROTEGIDAS (cualquier usuario logueado) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/festi" element={<FestiActual />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      {/* SÓLO ORGANIZADOR */}
      <Route element={<RoleRoute allow={["organizador"]} />}>
        <Route path="/actuaciones" element={<ActuacionesList />} />
        <Route path="/actuaciones/nueva" element={<CrearActuacion />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="/perfil/:userId" element={<Perfil />} />
      </Route>



    </Route>
  )




);