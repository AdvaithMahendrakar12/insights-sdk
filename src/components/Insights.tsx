import * as React from "react"; 
import  { useEffect, useState } from 'react'; 


export type InsightType = "trend" | "contributor";
export type TimeGrain = "daily" | "weekly" | "monthly";


export type DataResolver = (
  metric: string,
  grain: TimeGrain,
  fromTime: Date,
  toTime: Date
) => Promise<any[]>;

export type DimensionValuesResolver = (
  metric: string,
  dimension: string
) => Promise<string[]>;

export interface InsightProps {
  type: InsightType;
  metric: string;
  dimension?: string;
  timeGrain: TimeGrain;
  timeRange: number; 
  dataResolver: DataResolver,
  dimensionValuesResolver?: DimensionValuesResolver
}

// Resolver output
// [
//   { "fromtime": "01-01-2025", "totime": "07-01-2025", "Revenue": 123 },
//   { "fromtime": "08-01-2025", "totime": "14-01-2025", "Revenue": 235 },
//   ...
// ]
    //geneerate data fro this


const Insight = ({type,
  metric, 
  dimension, 
  timeGrain, 
  timeRange,
  dataResolver,
  dimensionValuesResolver} :InsightProps) => {


    const [data,setData] = useState<any[]>([]); //populate this based on the metric revenue or anything and timeLine is important 
    const [loading , setLoading] = useState<boolean>(false); 
    const [error , setError] = useState<string|null>(null); 
     const [dimensionValues, setDimensionValues] = useState<string[]>([]);

    //helper functions


    //dimension - India,NZ and all 
    //timeRange - 
    //metric - 
    //grain - weekly , 
    //should generate based on this 
    //then call dataResolcver

    // dataResolver -> // {
//   "fromtime": "01-01-2025",
//   "totime": "01-02-2025",
//   "metric": "Revenue",
//   "grain": "weekly",
//   "type": "Trend"
// }

    const dateRangeCalculator = () => {
        const toTime=  new Date(); 
        const fromTime = new Date(); 
        //they give 30 days lets say 
        // fromDate(toDate - timeRange); 
        fromTime.setDate(toTime.getDate() - timeRange);  

        return {toTime,fromTime}; 
    }

 

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); 
            setError(null); 
            try {
                const {toTime, fromTime} = dateRangeCalculator(); 
                   if (type === "contributor" && !dimension) {
                        setError("Dimension is required for contributor insight");
                        setLoading(false);
                        return;
                    }
                if(type == 'contributor' && dimensionValuesResolver && dimension){
                    const dim = await dimensionValuesResolver(metric,dimension); 
                    setDimensionValues(dim); 
                }
                const result = await dataResolver(metric, timeGrain, fromTime, toTime);
                setData(result);
            } catch (error) {
                 if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load data!");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchData(); 
    },[type, metric, dimension, timeGrain, timeRange, dataResolver, dimensionValuesResolver]);


    if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading {metric} data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <p>Error: {error}</p>
      </div>
    );
  }
   if (data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No data available</p>
      </div>
    );
  }
return (
    <div style={{ padding: '20px' }}>
      <h3>{metric} - {type} ({timeGrain})</h3>
      <pre style={{ 
         backgroundColor: '#f5f5f5',
        padding: '10px',
        color: '#333',          
        borderRadius: '4px',    
        overflow: 'auto'         
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
      {dimensionValues.length > 0 && (
        <div>
          <p>Dimensions: {dimensionValues.join(', ')}</p>
        </div>
      )}
    </div>
  );
}


export default Insight; 