import NotFound from "../assets/imgs/NotFound.jsx"


export default function PageNotFound() {
    return (
        <>
            <div className="flex justify-center items-center -z-10 absolute inset-0 w-dvw  pointer-events-none">
                <NotFound 
                inkClassName="fill-charcoal dark:fill-whity"
                fillClassName="fill-amber-400"
                showText
                />
            </div>
            
        </>
    )
}
