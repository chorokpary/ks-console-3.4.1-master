import React, { useEffect, useState } from 'react'
import { get, remove } from 'lodash'

import CustomLegend from 'components/Charts/Custom/Legend'
import CustomTooltip from 'components/Charts/Custom/Tooltip'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Dot,
  Scatter
} from "recharts";

const CustomChart = ({
  data
}) => {

  const [activeSeries, setActiveSeries] = useState([
    'x86_usage',
    'arm_usage',
    'x86_power',
    'arm_power',
  ])

  const handleLegendClick = (e, key) => {
    let arr = activeSeries.slice();

    if (arr.includes(key)) {
      remove(arr, item => item === key)
    } else {
      arr.push(key)
    }
    setActiveSeries(arr)
  }

  return (
    <>
      <ResponsiveContainer width={'100%'} height={'100%'} debounce={1}>
        <ComposedChart
          data={data}
          margin={{ top: 40, right: -20, bottom: -20, left: -20 }}>
          <CartesianGrid
            stroke={'#d8dee5'}
            strokeDasharray="2 2"
            vertical={false}
          />
          <Legend
            wrapperStyle={{
              top: 0,
              left: 'auto',
              right: 0,
              width: '80%',
              zIndex: 100,
            }}
            content={
              <CustomLegend
                activeSeries={activeSeries}
                onClick={handleLegendClick}
              />
            }
          />
          <XAxis dataKey="time" strokeWidth="0"/>
          <YAxis yAxisId="left" type="number" dataKey="x86_usage" name="weight" stroke="#8884d8" strokeWidth="0"/>
          <YAxis
            yAxisId="right"
            type="number"
            dataKey="x86_power"
            name="weight"
            orientation="right"
            strokeWidth="0"
          />
          <Tooltip
            content={<CustomTooltip />}
          />
          <Line yAxisId="right" type="monotone" dataKey="arm_power" stroke="#52d698"
            hide={!activeSeries.includes('arm_power')} />
          <Line yAxisId="right" type="monotone" dataKey="x86_power" stroke="#8d96ea"
            hide={!activeSeries.includes('x86_power')} />
          <Bar yAxisId="left" dataKey="arm_usage" barSize={20} fill="#6cc294" stroke="#6cc294"
            hide={!activeSeries.includes('arm_usage')} />
          <Bar yAxisId="left" dataKey="x86_usage" barSize={20} fill="#799bf3" stroke="#799bf3"
            hide={!activeSeries.includes('x86_usage')} />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  )
}

export default CustomChart