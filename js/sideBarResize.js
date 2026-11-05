function sidebarHandler(){

    const sidebar = document.querySelector(".sidebar")
    const handle = document.querySelector(".resize-handle")
    
    let isResizing = false
    
    handle.addEventListener("pointerdown", (e) => {
        isResizing = true
        handle.setPointerCapture(e.pointerId)
        document.body.style.userSelect = "none"
    })
    
    handle.addEventListener("pointermove", (e) => {
        if (!isResizing) return
    
        const width = e.clientX
        const minWidth = 230
        const maxWidth = 450
    
        sidebar.style.width = `${Math.max(
            minWidth,
            Math.min(maxWidth, width)
        )}px`
    })
    
    handle.addEventListener("pointerup", () => {
        isResizing = false
        document.body.style.userSelect = ""
    })
    
    handle.addEventListener("pointercancel", () => {
        isResizing = false
        document.body.style.userSelect = ""
    })

}

sidebarHandler()