import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/navbar.jsx'
import FullLoader from '../components/Loaders.jsx'


export default function Layout() {
    const { pathname } = useLocation()
    return (
        <>
            <Navbar />
            <main>
                <Suspense key={pathname} fallback={<FullLoader/>}>
                    <Outlet />
                </Suspense>
            </main>
        </>
    )
}