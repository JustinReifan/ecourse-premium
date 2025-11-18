export default function AppLogo() {
    return (
        <>
            <a href="/" className="flex items-center gap-2">
                <div className="text-sidebar-primary-foreground flex aspect-square size-10 flex-shrink-0 items-center justify-center rounded-md">
                    {/* <AppLogoIcon className="size-5 fill-current text-white dark:text-black" /> */}
                    <img src="/storage/landing/logo/nav-logo.svg" alt="" className="w-full" />
                </div>
                <div className="ml-1 grid flex-1 text-left text-sm md:text-base">
                    <span className="mb-0.5 truncate leading-none font-semibold">Pondok Grafis</span>
                </div>
            </a>
        </>
    );
}
