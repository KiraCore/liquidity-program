import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import styled from 'styled-components'

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
// import am4themes_material from "@amcharts/amcharts4/themes/material";
// import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
// import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_frozen from "@amcharts/amcharts4/themes/frozen";

am4core.useTheme(am4themes_frozen);
am4core.useTheme(am4themes_animated);

export interface AxisParam {
  chart: any
  field: string
  name: string
  opposite: boolean
  bullet: string
}

const Chart: React.FC = () => {
  const currentChart = useRef(null);
  
  // generate some random data, quite different range
  const generateChartData = () => {
    let chartData = [];
    // current date
    let firstDate = new Date();
    // now set 500 minutes back
    firstDate.setMinutes(firstDate.getDate() - 500);

    // and generate 500 data items
    let amount = 500;
    let price = 0;
    for (var i = 0; i < 100; i++) {
        let newDate = new Date(firstDate);
        // each time we add one minute
        newDate.setMinutes(newDate.getMinutes() + i);
        // some random number
        amount = Math.round((Math.random()<0.5?2:1)*Math.random()*1000);
        price = Math.round((Math.random()<0.5?2:1)*Math.random()*10);
        // add data item to the array
        chartData.push({
            date: newDate,
            amount: amount,
            price: price,
        });
    }

    return chartData;
  }
  
  useLayoutEffect(() => {
    let chart = am4core.create("chartdiv", am4charts.XYChart);

    // Chart title
    let title = chart.titles.create();
    title.text = "Kira Liquidity Auction Status";
    title.fill = am4core.color("purple");
    title.fontSize = 20;
    title.paddingBottom = 10;

    // Increase contrast by taking evey second color
    chart.colors.step = 2;

    // Add data
    chart.data = generateChartData();

    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.baseInterval = {
      "timeUnit": "minute",
      "count": 1
    };
    dateAxis.tooltipDateFormat = "HH:mm, d MMMM";

    let priceAxis = chart.yAxes.push(new am4charts.ValueAxis());
    priceAxis.title.text = "Price / KEX (USD)"
    priceAxis.title.fontWeight = "bold";
    priceAxis.tooltip.disabled = true;

    let amountAxis = chart.yAxes.push(new am4charts.ValueAxis());
    amountAxis.title.text = "Amount Raised [USD]"
    priceAxis.title.fontWeight = "bold";
    amountAxis.tooltip.disabled = true;
    amountAxis.renderer.opposite = true;
    amountAxis.renderer.grid.template.disabled = true;

    let priceSeries = chart.series.push(new am4charts.ColumnSeries());
    priceSeries.dataFields.dateX = "date";
    priceSeries.dataFields.valueY = "price";
    priceSeries.yAxis = priceAxis;
    priceSeries.defaultState.transitionDuration = 0;
    priceSeries.strokeWidth = 1;
    priceSeries.name = "KEX Price";
    priceSeries.tooltipText = "{name}: [bold]{valueY}[/]";
    priceSeries.showOnInit = true;

    priceAxis.renderer.line.strokeOpacity = 1;
    priceAxis.renderer.line.strokeWidth = 2;
    priceAxis.renderer.line.stroke = priceSeries.stroke;
    priceAxis.renderer.labels.template.fill = am4core.color("green");

    let amountSeries = chart.series.push(new am4charts.LineSeries());
    amountSeries.dataFields.dateX = "date";
    amountSeries.dataFields.valueY = "amount";
    amountSeries.name = "Amount";
    amountSeries.yAxis = amountAxis;
    amountSeries.strokeWidth = 2;
    amountSeries.interpolationDuration = 500;
    amountSeries.defaultState.transitionDuration = 0;
    amountSeries.tooltipText = "{name}: [bold]{valueY}[/]";
    amountSeries.tensionX = 0.8;

    amountAxis.renderer.line.strokeOpacity = 1;
    amountAxis.renderer.line.strokeWidth = 2;
    amountAxis.renderer.line.stroke = amountSeries.stroke;
    amountAxis.renderer.labels.template.fill = am4core.color("red");

    amountSeries.numberFormatter.numberFormat = "#.#a";
    amountSeries.numberFormatter.bigNumberPrefixes = [
      { "number": 1e+3, "suffix": "K" },
      { "number": 1e+6, "suffix": "M" },
      { "number": 1e+9, "suffix": "B" }
    ];

    let bullet = amountSeries.bullets.push(new am4charts.CircleBullet());
    bullet.circle.radius = 3;
    bullet.circle.strokeWidth = 1;
    bullet.circle.fill = am4core.color("#fff");

    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Add scrollbar
    // let scrollbarX = new am4charts.XYChartScrollbar();
    // scrollbarX.series.push(priceSeries);
    // scrollbarX.parent = chart.bottomAxesContainer;
    // chart.scrollbarX = scrollbarX;

    currentChart.current = chart;

    return () => {
      chart.dispose();
    };
  }, [])

  return (
    <StyledWrapper>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
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
