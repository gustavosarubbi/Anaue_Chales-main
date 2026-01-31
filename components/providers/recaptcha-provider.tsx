"use client"

import type React from "react"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"
import { ENV } from "@/lib/utils/env"

export function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
    const siteKey = ENV.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    if (!siteKey) {
        return <>{children}</>
    }

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={siteKey}
            scriptProps={{
                async: true,
                defer: true,
                appendTo: "head",
                nonce: undefined,
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    )
}
