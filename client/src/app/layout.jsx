import "./globals.css"; 

export const metadata = {
  title: "Collab Docs", 
  description: "Real-time collaborative document editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}