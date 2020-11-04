import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import styled from 'styled-components'
import useInterval from 'use-interval'
import { Bar } from 'react-chartjs-2'

import WalletProviderModal from '../../../components/WalletProviderModal'
import useAuctionConfig from '../../../hooks/useAuctionConfig'
import useAuctionData from '../../../hooks/useAuctionData'
import useModal from '../../../hooks/useModal'
import { getBalance } from '../../../utils/auction'

const Chart: React.FC = () => {
  const rand = () => Math.floor(Math.random() * 255)
  const timeInterval = 60 * 60 * 5; // 1 hour

  const options: object = {
    scales: {
      yAxes: [
        {
          id: 'price',
          type: 'linear',
          position: 'left',
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
          gridLines: {
            drawOnArea: false,
          },
          ticks: {
            callback: (value: number, index: number, values: number) => {
              return '$' + value;
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
        label: 'Price',
        backgroundColor: `rgb(88, 201, 62)`,
        borderColor: `rgb(88, 201, 62)`,
        borderWidth: 2,
        fill: false,
        yAxisID: 'price',
        data: [] as number[],
      },
      {
        type: 'bar',
        label: 'Amount Raised',
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
  }, 5000);

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
