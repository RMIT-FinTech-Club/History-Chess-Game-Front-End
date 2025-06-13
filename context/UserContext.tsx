"use client"

import { createContext, useState } from "react"

const user = {
    name: "Negic Legend",
    dept: "Tech",
    balance: 1000
}

export const BalanceContext = createContext<[number, React.Dispatch<React.SetStateAction<number>>] | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [balance, setBalance] = useState<number>(user.balance)

    return (
        <BalanceContext.Provider value={[balance, setBalance]}>
            {children}
        </BalanceContext.Provider>
    )
}

export default user;