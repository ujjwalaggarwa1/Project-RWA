export default function MenuIcon({ icon = 'close', className = '', size = 24, ...props }) {
    const open = icon !== 'close'

    const bar = 'origin-center [transform-box:fill-box] transition-all duration-500 ease-in-out'

    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className} transition-all duration-500 ease-in-out ${open ? 'rotate-360' : ''}`}
        {...props}
        >
        <path d="M4 5h16"  className={`${bar} ${open ? 'translate-y-[7px] rotate-45 scale-x-[1.06]' : ''}`} />
        <path d="M4 12h16" className={`${bar} ${open ? 'scale-x-0 opacity-0' : ''}`} />
        <path d="M4 19h16" className={`${bar} ${open ? '-translate-y-[7px] -rotate-45 scale-x-[1.06]' : ''}`} />
        </svg>
    )
}