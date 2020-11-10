import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Bar } from 'react-chartjs-2'

import { AuctionData } from '../../../contexts/Auction'

const abbreviateNumber = (value: number)  => {
  let newValue;
  if (value < 1000) return value;
  if (value >= 1000) {
      var suffixes = ["", "K", "M", "B", "T"];
      var suffixNum = Math.floor(("" + value).length / 3);
      var shortValue;
      for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
          var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
          if (dotLessShortValue.length <= 2) { break; }
      }
      if (shortValue % 1 !== 0)  shortValue = shortValue.toFixed(1);
      newValue = shortValue + suffixes[suffixNum];
  } 
  return newValue;
}

interface ChartProps {
  auctionData?: AuctionData
}

const Chart: React.FC<ChartProps> = ({ auctionData }) => {
  const [tick, setTick] = useState(100);
  const options: object = {
    // maintainAspectRatio: false,
    title: {
      display: true,
      fontSize: 25,
      text: "Kira Liquidity Auction"
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem: any) => {
          var label = tooltipItem.datasetIndex === 0 ? "Price" : tooltipItem.datasetIndex === 1 ? "Amount" : "";
          if (label) label += ": $";
          label += tooltipItem.yLabel;
          return label;
        }
      }
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            display: true,
            color: "rgba(33, 33, 33, 0.2)",
          },
          scaleLabel: {
            display: true,
            labelString: "Time",
          }
        }
      ],
      yAxes: [
        {
          id: 'price',
          position: 'left',
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: 'Max Projected Price [KEX/USD]',
            fontColor: "rgba(88, 201, 62)",
          },
          ticks: {
            max: 3,
            beginAtZero: false,
          },
          gridLines: {
            drawOnArea: false,
            color: "rgba(88, 201, 62, 0.2)",
          },
        },
        {
          id: 'amount',
          type: 'linear',
          position: 'right',
          scaleLabel: {
            display: true,
            labelString: 'Current Amount Raised [USD]',
            fontColor: "rgba(199, 75, 64)",
          },
          gridLines: {
            drawOnArea: false,
            color: `rgba(199, 75, 64, 0.2)`,
          },
          ticks: {
            min: 0,
            max: tick,
            callback: (value: number, index: number, values: number) => {
              return '$' + abbreviateNumber(value);
            }
          }
        }
      ],
    },
  }

  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        type: 'line',
        label: 'Max Projected Price [KEX/USD]',
        backgroundColor: `rgb(88, 201, 62)`,
        borderColor: `rgb(88, 201, 62)`,
        borderWidth: 2,
        fill: false,
        yAxisID: 'price',
        data: [] as number[],
      },
      {
        type: 'bar',
        label: 'Current Amount Raised [USD]',
        backgroundColor: `rgba(199, 75, 64)`,
        borderColor: 'rgba(199, 75, 64)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'amount',
        data: [] as number[],
      },
    ],
  });
  
  // const kira = useKira()
  // const auctionConfig = useAuctionConfig();
  // const kexAmount = useTokenInitialSupply(getKiraAddress(kira))

  useEffect(() => {
    if (auctionData) {
      let tick = 1;
      let totalPrice = auctionData.totalRaisedInUSD
      
      while (totalPrice > 1) {
        totalPrice /= 10;
        tick *= 10;
      }

      setTick(tick)
    }
  }, [auctionData])

  useEffect(() => {
    if(auctionData) {
      chartData.labels = auctionData.labels;
      chartData.datasets[0].data = auctionData.prices;
      chartData.datasets[1].data = auctionData.amounts;

      setChartData(chartData);
    }
  }, [auctionData, chartData])

  return (
    <StyledWrapper>
      {/* {!!auctionConfig && (<div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>)} */}
      {<Bar 
        data={chartData} 
        options={options} 
        type="bar" 
      />}
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
