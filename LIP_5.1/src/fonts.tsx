import { Global } from "@emotion/react"

const Fonts = () => (
  <Global
    styles={`
      /* latin */
      @font-face {
        font-family: 'Axiforma';
        font-style: normal;
        font-display: swap;
        src: url('/fonts/Axiforma-Regular.woff2') format('woff2'), url('/fonts/Axiforma-Regular.woff') format('woff');
      }
      `}
  />
)
export default Fonts
