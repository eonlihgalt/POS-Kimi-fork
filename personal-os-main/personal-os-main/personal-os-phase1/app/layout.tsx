import type { ReactNode } from 'react';
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body style={{fontFamily:'system-ui',maxWidth:820,margin:'40px auto',padding:'0 20px',background:'#f6f7f8',color:'#172027'}}>{children}</body></html>}
