import { useEffect, useState } from "react";

const LoadingSpinner = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Start animation
    setIsActive(true);

    // Reset animation periodically to create infinite loop
    const interval = setInterval(() => {
      setIsActive(false);

      // Small delay before reactivating
      setTimeout(() => {
        setIsActive(true);
      }, 100);
    }, 2800); // Full animation cycle + small buffer

    return () => clearInterval(interval);
  }, []);

  // Define styles as objects
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    svgElem1: {
      fill: isActive ? "rgb(27, 113, 255)" : "transparent",
      transition: "fill 0.7s cubic-bezier(0.47, 0, 0.745, 0.715) 0.8s",
    },
    svgElem2: {
      fill: isActive ? "url(#paint0_linear_103_109)" : "transparent",
      transition: "fill 0.7s cubic-bezier(0.47, 0, 0.745, 0.715) 0.9s",
    },
    svgElem3: {
      fill: isActive ? "url(#paint1_linear_103_109)" : "transparent",
      transition: "fill 0.7s cubic-bezier(0.47, 0, 0.745, 0.715) 1s",
    },
    svgElem4: {
      fill: isActive ? "rgb(27, 113, 255)" : "transparent",
      transition: "fill 0.7s cubic-bezier(0.47, 0, 0.745, 0.715) 1.1s",
    },
  };

  return (
    <div style={styles.container}>
      <svg
        width="55"
        height="43"
        viewBox="0 0 55 43"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M28.6646 33.9623C28.6646 35.326 29.3935 36.3093 31.1185 37.2719C33.407 38.5489 41.8239 41.2181 44.8638 42.1842C46.6506 42.752 48.0262 41.1181 45.9449 38.747C44.2104 36.7713 36.5632 28.3359 32.6463 24.1477C30.694 22.0602 28.6646 20.3347 28.6646 16.7724V33.9623Z"
          style={styles.svgElem1}
        />
        <path
          d="M51.2898 0.839504C45.9697 3.49075 36.5696 8.91989 32.512 11.1961C29.655 12.7989 28.6646 14.9702 28.6646 16.7724V33.9624C29.0751 30.6912 31.5806 28.3857 33.6069 26.0571C38.8717 20.0063 50.6791 6.83228 53.1011 4.10024C55.4451 1.45613 55.4697 -8.39233e-05 53.9895 5.34058e-05C53.3492 0.00012207 52.4271 0.272709 51.2898 0.839504Z"
          style={styles.svgElem2}
        />
        <path
          d="M1.89888 4.10024C4.32093 6.83228 16.1281 20.0063 21.393 26.0571C23.4193 28.3857 25.9248 30.6912 26.3353 33.9624V16.7724C26.3353 14.9702 25.3451 12.7989 22.4879 11.1961C18.4303 8.91989 9.03019 3.49075 3.71013 0.839504C2.57283 0.272709 1.6508 0.00012207 1.01055 5.34058e-05C-0.469689 5.34058e-05 -0.445181 1.45613 1.89888 4.10024Z"
          style={styles.svgElem3}
        />
        <path
          d="M22.3538 24.1477C18.4369 28.3359 10.7896 36.7713 9.05528 38.747C6.97385 41.1181 8.34948 42.752 10.1363 42.1842C13.1763 41.2181 21.5932 38.5489 23.8815 37.2719C25.6066 36.3093 26.3355 35.326 26.3355 33.9623V16.7724C26.3355 20.3347 24.306 22.0602 22.3538 24.1477Z"
          style={styles.svgElem4}
        />
        <defs>
          <linearGradient
            id="paint0_linear_103_109"
            x1="30.3159"
            y1="26.6213"
            x2="44.043"
            y2="-6.47334"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0050BF" />
            <stop offset="0.113734" stopColor="#0050BF" />
            <stop offset="1" stopColor="#41E0F2" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_103_109"
            x1="24.6841"
            y1="26.6213"
            x2="10.957"
            y2="-6.47334"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0050BF" />
            <stop offset="0.113734" stopColor="#0050BF" />
            <stop offset="1" stopColor="#41E0F2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
