import React, { useEffect, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ReactSortable } from 'react-sortablejs';

import { getData, saveData } from './firestore';

const isMobileDevice = window.innerWidth <= 1000;
console.log('IS MOBILE DEVICE', isMobileDevice);
const shadow = '1px 1px 3px rgba(0, 0, 0, 0.15)';
const borderRadius = '4px';
const metricHeight = isMobileDevice ? 10 : 20;
const metricWidth = isMobileDevice ? 250 : 500;
const colors = [
  '#7F8DFF',
  '#FF7F7F',
  '#8DFE7F',
];

const GlobalStyles = createGlobalStyle`
  body {
    font-family: sans-serif;
    margin: 0;
  }

  * {
    box-sizine: border-box;
    outline: none;
  }
`;

const StyledApp = styled.div`
  padding: 25px;
`;

const Header = styled.div`
  display: flex;
  justify-content: ${isMobileDevice ? 'center' : 'flex-end'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: ${isMobileDevice ? 15 : 25}px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: ${shadow};
  z-index: 1;
`;

const AddNewButton = styled.div`
  background-color: whitesmoke;
  display: inline-block;
  padding: 5px;
  border-radius: ${borderRadius};
  box-shadow: ${shadow};
  cursor: pointer;
  font-size: ${isMobileDevice && '12px'};
  margin: ${isMobileDevice && '10px'};
  line-height: 1;
`;

const Metrics = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: ${isMobileDevice && '-10px'};
`;

const Metric = styled.div`
  margin-right: ${isMobileDevice || '15px'};
  margin: ${isMobileDevice && '10px'};
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const MetricColor = styled.div`
  height: ${isMobileDevice ? 15 : 20}px;
  width: ${isMobileDevice ? 15 : 20}px;
  border-radius: ${borderRadius};
  background-color: ${({ color }) => color};
  position: relative;
`;

const DeleteMetricButton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  padding-left: 2px;
  cursor: pointer;
  display: none;

  ${MetricColor}:hover & {
    display: flx;
  }
`;

const MetricLabel = styled.div`
  margin-left: 10px;
  user-select: none;
  line-height: 1;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;
`;

const DataGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DataGroupData = styled(ReactSortable)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const DataItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  flex-direction: ${isMobileDevice ? 'column' : 'row'};
`;

const DataItemLabel = styled.div`
  font-size: ${isMobileDevice ? 14 : 18}px;
  margin-right: ${isMobileDevice || 25}px;
  position: relative;
  padding: 10px 0 10px ${isMobileDevice ? 0 : '5px'};
  cursor: ${({ sortDisabled }) => sortDisabled ? 'initial' : 'grab'};
  user-select: none;
`;

const DeleteDataItemButton = styled.div`
  position: absolute;
  top: 0;
  right: 100%;
  bottom: 0;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding-bottom: 2px; /* off-center emoji */
  display: none;
  cursor: pointer;

  ${DataItemLabel}:hover & {
    display: flex;
  }
`;

const DataItemMetrics = styled.div`
  display: flex;
  flex-direction: column;
  width: ${metricWidth}px;
`;

const StyledDataItemMetric = styled.div`
  background-color: ${({ color }) => color};
  width: ${({ width }) => width * metricWidth}px;
  height: ${metricHeight}px;
  border-radius: 10px;
  position: relative;

  & + & {
    margin-top: 5px;
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: -20px;
  bottom: 0;
  width: 40px;
  cursor: ew-resize;
`;

const AddNewRow = styled.div`
  display: flex;
  align-items: center;
`;

const AddNewInputContainer = styled.div`
  border-radius: ${borderRadius};
  box-shadow: ${shadow};
  background-color: whitesmoke;
  padding: 3px 5px;
`;

const StyledAddNewInput = styled.input`
  border: none;
  border-bottom: 1px solid black;
  background: none;
  padding: 3px;
`;

const CancelButton = styled.div`
  margin-left: 10px;
  cursor: pointer;
  font-size: 14px;
`;
  
const SaveButton = styled.div`
  margin-left: 10px;
  cursor: pointer;
`;

const PageIdInputRow = styled.div`
  display: flex;
`;

const PageIdInput = styled.input``;

const defaultGroupedData = {
  groupedData: [
    {
      label: 'Group 1',
      data: [
        {
          label: 'Data Item 1',
          metrics: [
            { label: 'Metric 1' },
            { label: 'Metric 2' },
          ],
        },
      ],
    },
  ],
};

const AddNewInput = (props) => (
  <AddNewInputContainer>
    <StyledAddNewInput {...props} />
  </AddNewInputContainer>
);

const DataItemMetric = ({ handleResize, ...rest }) => {
  const ref = useRef();
  const [isResizing, setIsResizing] = useState();
  const { left } = ref.current?.getBoundingClientRect() || {};
  const resizeMin = left + metricHeight;
  const resizeMax = left + metricWidth;

  const startResizing = () => setIsResizing(true);
  const stopResizing = () => {
    if (!isResizing) return;
    setIsResizing(false);
    const currentWidth = ref.current.clientWidth;
    const resizeValue = currentWidth / metricWidth;
    handleResize({ resizeValue });
  };
  
  const handleMouseMove = ({ clientX }) => {
    if (!isResizing) return;
    const width = clientX >= resizeMax
      ? metricWidth
      : clientX <= resizeMin
        ? metricHeight
        : clientX - left;
    ref.current.style.width = width;
  };

  return (
    <StyledDataItemMetric ref={ref} {...rest}>
      {isMobileDevice || <ResizeHandle onMouseDown={startResizing} onMouseUp={stopResizing} onMouseOut={stopResizing} onMouseMove={handleMouseMove} />}
    </StyledDataItemMetric>
  );
};

export const App = () => {
  const [pageId, setPageId] = useState('');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [groupedData, setGroupedData] = useState([]);
  const [sortedGroupedData, setSortedGroupedData] = useState([]);
  const [currentSort, setCurrentSort] = useState({});
  const [sortableListRef, setSortableListRef] = useState();
  const [addingNewDataItem, setAddingNewDataItem] = useState(false);
  const [newDataItemValue, setNewDataItemValue] = useState('');
  const [addingNewMetric, setAddingNewMetric] = useState(false);
  const [newMetricValue, setNewMetricValue] = useState('');
  const metrics = groupedData.length && groupedData[0].data.length && groupedData[0].data[0].metrics?.map(({ label }) => label);

  useEffect(async () => {
    const localStoragePageId = localStorage.getItem('pageId');
    if (localStoragePageId) {
      const result = await getData(localStoragePageId);
      setGroupedData(result.groupedData);
      setPageLoaded(true);
      setPageId(localStoragePageId);
    }
  }, []);

  const updateGroupedData = (data) => {
    if (!pageId) return;
    setGroupedData(data);
    saveData({ groupedData: data }, pageId);
  }

  const updatePageId = ({ target: { value } }) => setPageId(value);

  /*
    Metric Operations
  */
  const addNewMetric = () => setAddingNewMetric(true);
  const updateNewMetricValue = ({ target: { value } }) => setNewMetricValue(value);
  const cancelAddNewMetric = () => {
    setAddingNewMetric(false);
    setNewMetricValue('');
  };
  const saveNewMetric = () => {
    updateGroupedData(groupedData.map((dataGroup) => ({
      ...dataGroup,
      data: dataGroup.data.map((dataItem) => ({
        ...dataItem,
        metrics: [
          ...dataItem.metrics,
          {
            label: newMetricValue,
            value: 0.5, // default value for all metrics is 50%
          }
        ]
      }))
    })));
    setAddingNewMetric(false);
    setNewMetricValue('');
  };
  const deleteMetric = (metric) => {
    updateGroupedData(groupedData.map((dataGroup) => ({
      ...dataGroup,
      data: dataGroup.data.map((dataItem) => ({
        ...dataItem,
        metrics: dataItem.metrics.filter(({ label }) => label !== metric),
      })),
    })));
  };
  const handleMetricResize = ({ dataItem: { label: dataItemLabel }, metric: { label: metricLabel } }) => ({ resizeValue }) => {
    updateGroupedData(groupedData.map((dataGroup) => ({
      ...dataGroup,
      data: dataGroup.data.map((dataItem) => (
        dataItem.label === dataItemLabel ? {
          ...dataItem,
          metrics: dataItem.metrics.map((metric) => (
            metric.label === metricLabel ? {
              ...metric,
              value: resizeValue,
            } : metric
          )),
        } : dataItem
      )),
    })));
  };
  
  /*
    Data Item Operations
  */
  const addNewDataItem = () => setAddingNewDataItem(true);
  const updateNewDataItemValue = ({ target: { value } }) => setNewDataItemValue(value);
  const cancelAddNewDataItem = () => {
    setAddingNewDataItem(false);
    setNewDataItemValue('');
  };
  const saveNewDataItem = () => {
    updateGroupedData(groupedData.map((dataGroup) => ({
      ...dataGroup,
      data: [
        ...dataGroup.data,
        {
          label: newDataItemValue,
          metrics: metrics.map((metric) => ({
            label: metric,
            value: 0.5, // default value for all metrics is 50%
          })),
        },
      ],
    })));
    setAddingNewDataItem(false);
    setNewDataItemValue('');
  };
  const deleteDataItem = (dataItem) => {
    updateGroupedData(groupedData.map((dataGroup) => ({
      ...dataGroup,
      data: dataGroup.data.filter(({ label }) => label !== dataItem.label),
    })));
  };

  const getPageData = async () => {
    localStorage.setItem('pageId', pageId);
    const result = await getData(pageId);
    if (!result) await saveData(defaultGroupedData, pageId);
    setGroupedData(result ? result.groupedData : defaultGroupedData);
    setPageLoaded(true);
  };

  const setSortedData = (sortedData) => {
    if (isMobileDevice) return // disable until mobile interaction is better defined
    if (sortedGroupedData.length) return; // don't save sorts in the db
    updateGroupedData(groupedData.map((dataGroup) => ({
      ...dataGroup,
      data: sortedData.map(({ label, metrics }) => ({
        label,
        metrics,
      })),
    })));
  };

  const sortByMetric = (metric) => {
    if (currentSort.metric === metric && currentSort.isSortAscending) {
      setCurrentSort({});
      setSortedGroupedData([]);
      sortableListRef.option('disabled', false);
      return;
    }
    sortableListRef.option('disabled', true);
    const isSortAscending = metric === currentSort.metric ? true : false
    setSortedGroupedData(groupedData.map((dataGroup) => ({
      ...dataGroup,
      data: [...dataGroup.data].sort((a, b) => {
        const aValue = a.metrics.find(({ label }) => label === metric).value;
        const bValue = b.metrics.find(({ label }) => label === metric).value;
        return isSortAscending ? aValue - bValue : bValue - aValue;
      }),
    })));
    setCurrentSort({
      metric,
      isSortAscending,
    });
  };

  return (
    <StyledApp>
      <GlobalStyles />
      {pageLoaded ? (
        <div>
          <Header>
            <Metrics>
              {metrics.length && metrics.map((metric, index) => (
                <Metric key={metric}>
                  <MetricColor color={colors[index % 3]}>
                    {isMobileDevice || <DeleteMetricButton onClick={() => deleteMetric(metric)}>❌</DeleteMetricButton>}
                  </MetricColor>
                  <MetricLabel onClick={() => sortByMetric(metric)}>
                    {metric}
                    {currentSort.metric === metric && (
                      currentSort.isSortAscending ? ' ⬆️' : ' ⬇️'
                    )}
                  </MetricLabel>
                </Metric>
              ))}
              {addingNewMetric ? (
                <AddNewRow>
                  <AddNewInput value={newMetricValue} onChange={updateNewMetricValue} />
                  <CancelButton onClick={cancelAddNewMetric}>❌</CancelButton>
                  {!!newMetricValue.length && <SaveButton onClick={saveNewMetric}>👍</SaveButton>}
                </AddNewRow>
              ) : <AddNewButton onClick={addNewMetric}>➕</AddNewButton>}
            </Metrics>
          </Header>
          <Content>
              {(sortedGroupedData.length ? sortedGroupedData : groupedData).map((dataGroup) => (
                <DataGroup key={dataGroup.label}>
                  {/* {dataGroup.label} */}
                  <DataGroupData
                    list={dataGroup.data}
                    setList={setSortedData}
                    handle={DataItemLabel}
                    disabled={!!sortedGroupedData.length || isMobileDevice}
                    ref={node => node && setSortableListRef(node.sortable)}
                  >
                  {dataGroup.data.map((dataItem) => (
                    <DataItem key={dataItem.label}>
                      <DataItemLabel sortDisabled={!!sortedGroupedData.length}>
                        {dataItem.label}
                        {isMobileDevice || <DeleteDataItemButton onClick={() => deleteDataItem(dataItem)}>❌</DeleteDataItemButton>}
                      </DataItemLabel>
                      <DataItemMetrics>
                        {dataItem.metrics.map((metric, index) => (
                          <DataItemMetric
                            key={metric.label}
                            color={colors[index % 3]}
                            width={metric.value}
                            handleResize={handleMetricResize({ dataItem, metric })}
                          />
                        ))}
                      </DataItemMetrics>
                    </DataItem>
                  ))}
                  </DataGroupData>
                </DataGroup>
              ))}
            {addingNewDataItem ? (
              <AddNewRow>
                <AddNewInput value={newDataItemValue} onChange={updateNewDataItemValue} />
                <CancelButton onClick={cancelAddNewDataItem}>❌</CancelButton>
                {!!newDataItemValue.length && <SaveButton onClick={saveNewDataItem}>👍</SaveButton>}
              </AddNewRow>
            ) : <AddNewButton onClick={addNewDataItem}>➕</AddNewButton>}
          </Content>
        </div>
      ) : (
        <PageIdInputRow>
          <PageIdInput value={pageId} onChange={updatePageId} />
          {!!pageId.length && <SaveButton onClick={getPageData}>👍</SaveButton>}
        </PageIdInputRow>
      )}
    </StyledApp>
  )
};
