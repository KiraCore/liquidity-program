import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Bar } from 'react-chartjs-2'

import { AuctionData } from '../../../contexts/Auction'
import useAuctionConfig from '../../../hooks/useAuctionConfig'
import cfgData from '../../../config.json';

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
  const auctionConfig = useAuctionConfig();
  const resCnf: any = cfgData; // Config Data
  const kexAvailable = resCnf["available"] // max amount of KEX available for distribution
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
          if (tooltipItem.datasetIndex === 0) {
            label += ": $" + +tooltipItem.yLabel.toFixed(5);
          } else if (tooltipItem.datasetIndex === 1) {
            label += ": " + tooltipItem.yLabel.toFixed(3) + " ETH";
          }
          return label;
        }
      }
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
            color: "rgba(33, 33, 33, 0.1)",
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
            min: 0,
            max: auctionConfig && auctionConfig.P1 * +resCnf['ethusd'],
            beginAtZero: false,
            callback: (value: number, index: number, values: []) => {
              return '$' + value.toFixed(3);
            }
          },
          gridLines: {
            display: false,
            drawOnArea: false,
            color: "rgba(88, 201, 62, 0.1)",
          },
        },
        {
          id: 'amount',
          type: 'linear',
          position: 'right',
          scaleLabel: {
            display: true,
            labelString: 'Current Amount Raised [ETH]',
            fontColor: "rgba(199, 75, 64)",
          },
          gridLines: {
            display: true,
            drawOnArea: false,
            color: `rgba(199, 75, 64, 0.1)`,
          },
          ticks: {
            min: 0,
            max: auctionConfig && kexAvailable * auctionConfig.P1,
            callback: (value: number, index: number, values: number) => {
              return value.toFixed(2) + ' ETH';
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
        label: 'Current Amount Raised [ETH]',
        backgroundColor: `rgba(199, 75, 64)`,
        borderColor: 'rgba(199, 75, 64)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'amount',
        data: [] as number[],
      },
    ],
  });
  
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
