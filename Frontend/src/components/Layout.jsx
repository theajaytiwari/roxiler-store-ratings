import Navbar from './Navbar';

export default function Layout({ title, children }) {
  return (
    <>
      <Navbar />
      <main className="container">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>
    </>
  );
}
