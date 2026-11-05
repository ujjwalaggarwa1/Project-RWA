function menuHandler() {
    const sidebar = document.querySelector(".sidebar")
    const menu_btns = document.querySelectorAll(".menu-btn")
    const handle = document.querySelector(".resize-handle")

    if (!sidebar || !handle || !handle) return


    function toggleSidebar() {
        

        menu_btns.forEach(btn => {
            btn.classList.toggle('scale-0')
        })

    }



    menu_btns.forEach(btn => {
        btn.addEventListener('click', toggleSidebar)
    })


}

menuHandler()