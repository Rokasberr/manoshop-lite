const lossNumberStreams = [
  { value: "-18", x: "7%", size: "0.82rem", duration: "18s", delay: "-2s", opacity: 0.34, blur: "0px" },
  { value: "-42", x: "16%", size: "1.12rem", duration: "24s", delay: "-12s", opacity: 0.24, blur: "0.4px" },
  { value: "-7", x: "26%", size: "0.72rem", duration: "16s", delay: "-7s", opacity: 0.3, blur: "0px" },
  { value: "-128", x: "35%", size: "1.42rem", duration: "29s", delay: "-18s", opacity: 0.18, blur: "1.2px" },
  { value: "-64", x: "48%", size: "0.92rem", duration: "21s", delay: "-5s", opacity: 0.28, blur: "0.2px" },
  { value: "-215", x: "58%", size: "1.08rem", duration: "26s", delay: "-22s", opacity: 0.2, blur: "0.7px" },
  { value: "-9", x: "69%", size: "0.78rem", duration: "19s", delay: "-14s", opacity: 0.32, blur: "0px" },
  { value: "-83", x: "78%", size: "1.28rem", duration: "31s", delay: "-9s", opacity: 0.16, blur: "1px" },
  { value: "-31", x: "88%", size: "0.88rem", duration: "23s", delay: "-26s", opacity: 0.24, blur: "0.5px" },
];

const gainNumberStreams = [
  { value: "+24", x: "10%", size: "0.8rem", duration: "20s", delay: "-10s", opacity: 0.3, blur: "0px" },
  { value: "+118", x: "20%", size: "1.34rem", duration: "30s", delay: "-4s", opacity: 0.17, blur: "1px" },
  { value: "+6", x: "31%", size: "0.74rem", duration: "17s", delay: "-15s", opacity: 0.34, blur: "0px" },
  { value: "+72", x: "43%", size: "1rem", duration: "23s", delay: "-8s", opacity: 0.26, blur: "0.4px" },
  { value: "+305", x: "55%", size: "1.48rem", duration: "34s", delay: "-24s", opacity: 0.15, blur: "1.3px" },
  { value: "+41", x: "66%", size: "0.9rem", duration: "21s", delay: "-3s", opacity: 0.3, blur: "0.2px" },
  { value: "+156", x: "76%", size: "1.12rem", duration: "28s", delay: "-19s", opacity: 0.19, blur: "0.8px" },
  { value: "+12", x: "86%", size: "0.78rem", duration: "18s", delay: "-11s", opacity: 0.32, blur: "0px" },
  { value: "+89", x: "94%", size: "1.22rem", duration: "25s", delay: "-27s", opacity: 0.2, blur: "0.7px" },
];

const FloatingMarketNumbers = () => (
  <div className="floating-market-numbers absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
    <div className="floating-market-field floating-market-field-loss">
      {lossNumberStreams.map((stream) => (
        <span
          key={`loss-${stream.value}-${stream.x}`}
          className="floating-market-number"
          style={{
            "--number-x": stream.x,
            "--number-size": stream.size,
            "--number-duration": stream.duration,
            "--number-delay": stream.delay,
            "--number-opacity": String(stream.opacity),
            "--number-blur": stream.blur,
          }}
        >
          {stream.value}
        </span>
      ))}
    </div>

    <div className="floating-market-field floating-market-field-gain">
      {gainNumberStreams.map((stream) => (
        <span
          key={`gain-${stream.value}-${stream.x}`}
          className="floating-market-number"
          style={{
            "--number-x": stream.x,
            "--number-size": stream.size,
            "--number-duration": stream.duration,
            "--number-delay": stream.delay,
            "--number-opacity": String(stream.opacity),
            "--number-blur": stream.blur,
          }}
        >
          {stream.value}
        </span>
      ))}
    </div>
  </div>
);

export default FloatingMarketNumbers;
