/** Route-loading treatment stays lightweight and screen-reader friendly. */
export default function Loading() {
  return (
    <main id="main" className="yor-state yor-state--loading" aria-busy="true">
      <div className="container yor-state__inner">
        <span className="technical yor-state__index">YOR / ENTERING THE STUDIO</span>
        <div className="yor-state__glyph" aria-hidden="true">✳</div>
        <h1>Making room for<br /><em>the details.</em></h1>
        <p role="status">Loading the experience…</p>
        <div className="yor-state__track" aria-hidden="true"><span /></div>
      </div>
    </main>
  );
}
