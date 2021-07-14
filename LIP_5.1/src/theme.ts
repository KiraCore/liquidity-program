const theme = {
  breakpoints: {
    sm: "320px",
    md: "768px",
    lg: "1200px",
    xl: "1440px",
    "2xl": "1680px"
  },
  styles: {
    global: {
      "html, body": {
        backgroundColor: '#060817',
        color: 'white',
        fontFamily: 'Axiforma'
      }
    }
  },
  colors: {
    gray: {
      senary: "#BAC8D7",
      secondary: "#273D51",
      quaternary: "#7994B0",
      quinary: "#627B95",
      tertiary: "#43596F",
      septenary: "#E3EFFA"
    },
    blue: {
      dark: '#4264F2'
    }
  },
  // sizes: {
  //   containers: {
  //     xl: '800px'
  //   }
  // }
  components: {
    // Container: {
    //   baseStyle: {
    //     maxW: "800px"
    //   }
    // }
    Heading: {
      sizes: {
        '3xl': {
          fontSize: '58px',
          lineHeight: '69.6px'
        }
      }
    }
  },
  // textStyles: {
  //   h1: {
  //     // you can also use responsive styles
  //     fontSize: ["44px", "58px", "58px", "58px", "58px"],
  //     lineHeight: ["52.8px", "69.6px"],
  //   },
  // },
}

export default theme;