import { ReactNode, HTMLAttributes } from "react"

interface ContentProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode
}

function Content({ children, className = "", ...props }: ContentProps) {

    return (
        <main className={`overflow-x-clip ${className}`} {...props}>
            {children}
        </main>
    )
}

export default Content