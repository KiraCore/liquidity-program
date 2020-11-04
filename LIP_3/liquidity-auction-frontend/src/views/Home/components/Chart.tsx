import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import styled from 'styled-components'
import useInterval from 'use-interval'
import { Bar } from 'react-chartjs-2'

import useAuctionConfig from '../../../hooks/useAuctionConfig'
// import useAuctionData from '../../../hooks/useAuctionData'
import { getBalance } from '../../../utils/auction'

const abbreviateNumber = (value: number)  => {
  let newValue;
  if (value < 1000) return value;
  if (value >= 1000) {
      var suffixes = ["", "K", "M", "B", "T"];
      var suffixNum = Math.floor( (""+value).length/3 );
      var shortValue;
      for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
          var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
          if (dotLessShortValue.length <= 2) { break; }
      }
      if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
      newValue = shortValue+suffixes[suffixNum];
  } 
  return newValue;
}

const Chart: React.FC = () => {
  const timeInterval = 60 * 60 * 5; // 1 hour

  const options: object = {
    scales: {
      yAxes: [
        {
          id: 'price',
          type: 'linear',
          position: 'left',
          display: true,
          labelString: 'Price / KEX (USD)',
          ticks: {
            beginAtZero: true,
          },
          gridLines: {
            drawOnArea: false,
          },
        },
        {
          id: 'amount',
          type: 'linear',
          position: 'right',
          display: true,
          labelString: 'Amount Raised [USD]',
          gridLines: {
            drawOnArea: false,
          },
          ticks: {
            callback: (value: number, index: number, values: number) => {
              return '$' + abbreviateNumber(value);
            }
          }
        }
      ],
    },
  }

  const [changed, setChanged] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        type: 'line',
        label: 'Price / KEX (USD)',
        backgroundColor: `rgb(88, 201, 62)`,
        borderColor: `rgb(88, 201, 62)`,
        borderWidth: 2,
        fill: false,
        yAxisID: 'price',
        data: [] as number[],
      },
      {
        type: 'bar',
        label: 'Amount Raised [USD]',
        backgroundColor: `rgba(199, 75, 64)`,
        borderColor: 'rgba(199, 75, 64)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'amount',
        data: [] as number[],
      },
    ],
  });

  // const currentChart = useRef(null);
  const auctionConfig = useAuctionConfig();
  
  useEffect(() => {
    if (auctionConfig) {
      fetchData()
    }
  }, [auctionConfig, changed])

  useInterval(async () => {
    fetchData()
  }, 50000);

  const fetchData = useCallback(async () => {
    // Your custom logic here
    const resData = await getBalance("mainnet", "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be");

    const T1M = auctionConfig.epochTime + auctionConfig.T1;
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;
    const priceOffsetP1P2 = (auctionConfig.P1 - auctionConfig.P2) / auctionConfig.T1;
    const priceOffsetP2P3 = (auctionConfig.P2 - auctionConfig.P3) / auctionConfig.T2;

    let labels = [] as string[]
    let prices = [] as number[]
    let amounts = [] as number[]
    const now = Date.now() / 1000;

    for (let currentTime = auctionConfig.epochTime; currentTime < now; currentTime += timeInterval) {
      let amountRaised = 0;
      let price = 0;

      Object.keys(resData['balances']).forEach((time) => {
          const blockTime = parseInt(time);
          if (blockTime >= auctionConfig.epochTime && blockTime <= currentTime) {
              amountRaised += parseInt(resData['balances'][time]['amount']);
          }
        });

      let currentTimeO = new Date(0);
      currentTimeO.setUTCSeconds(currentTime);
      const hour = currentTimeO.getUTCHours();
      const minute = currentTimeO.getUTCMinutes();
      
      // If the time is in T1 range
      if (currentTime < T1M) {
          price = auctionConfig.P1 - priceOffsetP1P2 * (currentTime - auctionConfig.epochTime)
      } else if (currentTime >= T1M && currentTime <= T2M) {
          price = auctionConfig.P2 - priceOffsetP2P3 * (currentTime - T1M)
      } else {
          price = auctionConfig.P3
      }

      labels.push([(hour > 9 ? '' : '0') + hour, (minute > 9 ? '' : '0') + minute].join(':'));
      prices.push(price);
      amounts.push(amountRaised);
    }

    chartData.labels = labels;
    chartData.datasets[0].data = prices;
    chartData.datasets[1].data = amounts

    setChartData(chartData)  
    setChanged(!changed)
  }, [auctionConfig, chartData, changed])


  return (
    <StyledWrapper>
      {/* {!!auctionConfig && (<div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>)} */}
      {!!auctionConfig && <Bar data={chartData} options={options} type="bar"/>}
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: stretch;
  }
  margin-top: 50px;
`

export default Chart
