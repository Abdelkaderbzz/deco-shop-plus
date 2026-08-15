import Script from 'next/script'
import { THEME_STORAGE_KEY } from '@/lib/theme'

/** Runs before paint so the first frame matches the saved theme. */
export function ThemeScript() {
  const script = `!function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="dark"){var r=document.documentElement;r.classList.add("dark");r.style.colorScheme="dark"}}catch(e){}}()`

  return (
    <Script id="wog-theme" strategy="beforeInteractive">
      {script}
    </Script>
  )
}
