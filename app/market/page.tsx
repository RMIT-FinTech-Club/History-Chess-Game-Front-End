'use client'

import ItemProfile from '@/components/market/ItemProfile'
import { useState } from 'react'

export default function Market() {
    const [profileMounted, setProfileMounted] = useState(false)

    function handleTurnOnProfile() {
        setProfileMounted(true)
    }

    function handleTurnOffProfile() {
        setProfileMounted(false)
    }

    return (
        <div className="relative h-[calc(100dvh-var(--navbar-height))]">
            {profileMounted && <ItemProfile
                name={'Vong Gom'}
                rarity={'Legendary'}
                price={8000}
                status={'Available'}
                desc={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}
                imgSrc={'https://iili.io/fJXUUan.png'}
                handleTurnOffProfile={handleTurnOffProfile}
            />}
        </div>
    )
}