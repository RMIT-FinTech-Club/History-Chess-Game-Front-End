import { ReactNode } from "react"

type ContentProps = { children: ReactNode }

function Content({ children }: ContentProps) {

    return (
        <main className="overflow-x-clip">
            {children}
        </main>
    )
}

export default Content