export function StaticMachine() {
  return (
    <div className="machine-static" aria-hidden="true">
      <svg viewBox="0 0 800 800" focusable="false">
        <defs>
          <linearGradient id="machine-titanium" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a8abad" stopOpacity="0.78" />
            <stop offset="0.42" stopColor="#34383b" stopOpacity="0.44" />
            <stop offset="1" stopColor="#111316" stopOpacity="0.76" />
          </linearGradient>
          <radialGradient id="machine-signal">
            <stop offset="0" stopColor="#ff1728" stopOpacity="0.82" />
            <stop offset="0.26" stopColor="#5d0710" stopOpacity="0.38" />
            <stop offset="1" stopColor="#030304" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform="translate(400 400)" fill="none" strokeLinecap="square">
          <path
            d="M0-288 142-246 246-142 288 0 246 142 142 246 0 288-142 246-246 142-288 0-246-142-142-246Z"
            stroke="url(#machine-titanium)"
            strokeWidth="2"
          />
          <path
            d="M0-238 117-205 205-117 238 0 205 117 117 205 0 238-117 205-205 117-238 0-205-117-117-205Z"
            stroke="#aeb0ad"
            strokeOpacity=".22"
          />
          <path d="M0-286V-237M202-202l-35 35M286 0h-49M202 202l-35-35M0 286v-49M-202 202l35-35M-286 0h49M-202-202l35 35" stroke="#d7d7d2" strokeOpacity=".32" />
          <path d="M0-238V-156M168-168l-58 58M238 0h-82M168 168l-58-58M0 238v-82M-168 168l58-58M-238 0h82M-168-168l58 58" stroke="#77787d" strokeOpacity=".28" />
          <path d="M-126-70 0-142 126-70 126 70 0 142-126 70Z" fill="url(#machine-titanium)" fillOpacity=".18" stroke="#d7d7d2" strokeOpacity=".38" />
          <path d="M-83-48 0-96 83-48 83 48 0 96-83 48Z" fill="#08090b" fillOpacity=".68" stroke="#d7d7d2" strokeOpacity=".32" />
          <path d="M-40-14 0-38 40-14 40 14 0 38-40 14Z" fill="#202326" stroke="#d7d7d2" strokeOpacity=".62" />
          <circle r="96" fill="url(#machine-signal)" stroke="none" />
          <path d="M-14 0H14M0-14V14" stroke="#ff1728" strokeWidth="2" />
          <path d="M-4 0H4" stroke="#efede7" strokeWidth="1" />
          <path d="M-320-1h37M283-1h37M0-320v37M0 283v37" stroke="#ff1728" strokeOpacity=".64" strokeWidth="2" />
          <path d="M-110-286l28 10M110 286l-28-10" stroke="#efede7" strokeOpacity=".52" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}
