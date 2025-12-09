export default function AppLogo() {
    return (
        <a href="/" className="flex items-center gap-2">
            <div className="text-sidebar-primary-foreground flex aspect-square size-20 flex-shrink-0 items-center justify-center rounded-md md:size-25">
                <img src="/storage/landing/logo/nav-logo.png" alt="Logo" className="w-full object-contain" />
            </div>

            {/* <div className="text-sidebar-primary-foreground flex-1 text-left text-sm leading-none font-semibold md:text-base">
                <span className="truncate">Grow Up Muslimpreneur</span>
            </div> */}
        </a>
    );
}
