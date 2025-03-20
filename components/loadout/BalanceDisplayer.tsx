"use client"

import { BalanceContext } from "@/context/UserContext"
import { useContext } from "react"

const BalanceDisplayer = () => {
    const context = useContext(BalanceContext)

    if (!context) {
        throw new Error("BalanceDisplayer must be used within a UserProvider")
    }

    const [balance] = context

    return (
        <div className="w-full h-[7vh] flex justify-end bg-amber-200 pr-[5vw] items-center">
            <p>{balance} FTC</p>
        </div>
    )
}

export default BalanceDisplayer