import {
  Button,
  Card,
  Input,
  Layout,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Form,
  Select,
  Row,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import "./App.css";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "../assets/arial-normal";
import "../assets/arialbd-bold";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
const typesCustomer: any = {
  DAT_NEN: "Đất nền",
  DAT_O: "Đất ở ",
  MAT_BANG: "Mặt bằng",
};
Chart.register(ArcElement, Tooltip, Legend);
interface ICustomer {
  key: string;
  name: string;
  age: number;
  address: string;
  type: string;
}

function App() {
  const [form] = Form.useForm();
  const [data, setData] = useState([
    {
      key: "1",
      name: "Trần Văn A",
      age: 32,
      address: "Quận 1, Hồ Chí Minh",
      type: "DAT_NEN",
    },
    {
      key: "2",
      name: "Nguyễn Văn B",
      age: 42,
      address: "Quận 2, Hồ Chí Minh",
      type: "DAT_O",
    },
    {
      key: "3",
      name: "Bùi Thị C",
      age: 32,
      address: "Quận 3. Hồ Chí Minh",
      type: "MAT_BANG",
    },
  ]);
  const [isVisible, setVisible] = useState(false);
  const [selectEdit, setSelectEdit] = useState({
    key: "",
    name: "",
    age: 0,
    address: "",
    type: "MAT_BANG",
  });
  const [headerCsv, setHeaderCsv] = useState([
    { label: "Name", key: "name" },
    { label: "Age", key: "age" },
    { label: "Address", key: "address" },
    { label: "Type", key: "type" },
  ]);

  let searchInput: any = null;
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={(node) => {
              searchInput = node;
            }}
            placeholder={`Nhập từ khóa cần tìm kiếm`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys, confirm, "name")}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, "name")}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                confirm({ closeDropdown: false });
                setSearchText(selectedKeys[0]);
                setSearchedColumn("name");
              }}
            >
              Filter
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: any) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value: any, record: any) =>
        record["name"]
          ? record["name"]
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
          : "",
      onFilterDropdownVisibleChange: (visible: any) => {
        if (visible) {
          setTimeout(() => searchInput?.select(), 100);
        }
      },
      render: (text: any) =>
        searchedColumn === "name" ? (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        ) : (
          text
        ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      sorter: (a: ICustomer, b: ICustomer) => a.age - b.age,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      filterSearch: true,
      onFilter: (value: any, record: ICustomer) =>
        record?.address?.indexOf(value) === 0,
    },
    {
      title: "Type",
      key: "type",
      dataIndex: "type",
      filters: [
        {
          text: "Mặt Bằng",
          value: "MAT_BANG",
        },
        {
          text: "Đất Ở",
          value: "DAT_O",
        },
        {
          text: "Đất nền",
          value: "DAT_NEN",
        },
      ],
      filterSearch: true,
      onFilter: (value: any, record: ICustomer) =>
        record?.type?.startsWith(value),
      render: (type: any) => {
        let color = "#9FE2BF";
        switch (type) {
          case "DAT_O":
            color = "#FF7F50";
            break;
          case "DAT_NEN":
            color = "#6495ED";
            break;
          default:
            break;
        }
        return (
          <Tag color={color} key={type}>
            {typesCustomer[type]}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: any) => (
        <Space size="middle">
          <Button
            onClick={() => {
              setSelectEdit(record);
              setVisible(true);
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectRows, setSelectRows] = useState([]);
  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText("");
  };
  const confirm = () => {
    let dataSource = data;
    if (selectRows.length > 0) {
      selectRows.map((key) => {
        dataSource = dataSource.filter((item) => item.key !== key);
      });
    }
    setData(dataSource);
    message.success("Xóa thành công.");
  };

  const cancel = () => {
    message.error("Bạn đã hủy.");
  };
  const exportToExcel = (data: any, header: any) => {
    let dataExcel: any[] = [];
    data.map((value: any) => {
      let tmp: any = {};
      Object.assign(tmp, value);
      tmp.type = typesCustomer[value.type];
      dataExcel.push(tmp);
    });
    return (
      <CSVLink filename={"customer.csv"} data={dataExcel} headers={header}>
        Export Excel
      </CSVLink>
    );
  };
  function createHeaders(keys: any) {
    var result = [];
    for (var i = 0; i < keys.length; i += 1) {
      result.push({
        name: keys[i],
        prompt: keys[i],
        width: "auto",
        align: "center",
        padding: 10,
      });
    }
    return result;
  }
  let _header: any = createHeaders(["name", "age", "address", "type"]);
  const exportToPDF = (data: any) => {
    let dataPDF: any[] = [];
    data.map((value: any) => {
      let tmp: any = {};
      Object.assign(tmp, value);
      tmp.type = typesCustomer[value.type];
      tmp.age = tmp.age.toString();
      dataPDF.push(tmp);
    });
    let doc = new jsPDF({
      orientation: "landscape",
    });
    doc.setFont("arial");

    doc.table(1, 1, dataPDF, _header, { autoSize: true });
    doc.save("customer");
  };
  const onFinish = (values: any) => {
    values.age = parseInt(values.age);
    if (!values?.key) {
      values.key = (data.length + 1).toString();
      let arrayDs = data.concat(values);
      setData(arrayDs);
    } else {
      const newData = [...data];
      const index = newData.findIndex((item) => item.key === values.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...values,
        });
        setData(newData);
      }
    }
    setVisible(!isVisible);
    form.resetFields();
  };

  const onReset = () => {
    form.resetFields();
  };
  let countDATO = 0;
  let countMATBANG = 0;
  let countDATNEN = 0;
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    switch (element.type) {
      case "DAT_O":
        countDATO++;
        break;
      case "DAT_NEN":
        countDATNEN++;
        break;
      case "MAT_BANG":
        countMATBANG++;
        break;
      default:
        break;
    }
  }
  return (
    <>
      <Layout>
        <Content>
          <Card title="Customer">
            <Row
              style={{
                width: "300px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <Pie
                data={{
                  labels: ["Đất Ở", "Mặt Bằng", "Đất Nền"],
                  datasets: [
                    {
                      label: "# of Votes",
                      data: [countDATO, countMATBANG, countDATNEN],
                      backgroundColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(255, 206, 86, 0.2)",
                      ],
                      borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
              />
            </Row>

            <Table
              id="table"
              rowSelection={{
                type: "checkbox",
                onChange: (selectedRowKeys: any, selectedRows: any) =>
                  setSelectRows(selectedRowKeys),
              }}
              columns={columns}
              dataSource={data}
              title={() => (
                <Space>
                  <Button type="primary" onClick={() => setVisible(true)}>
                    Create
                  </Button>
                  <Button type="primary" danger>
                    <Popconfirm
                      title="Bạn chắc chắn muốn xóa Customer?"
                      onConfirm={confirm}
                      onCancel={cancel}
                      okText="Có"
                      cancelText="Không"
                      disabled={selectRows.length === 0}
                    >
                      <a href="#">Delete</a>
                    </Popconfirm>
                  </Button>
                  <Button type="primary">
                    {exportToExcel(data, headerCsv)}
                  </Button>
                  <Button type="primary" onClick={() => exportToPDF(data)}>
                    Export PDF
                  </Button>
                </Space>
              )}
            />
          </Card>
        </Content>
      </Layout>
      <Modal
        footer={null}
        onCancel={() => setVisible(false)}
        title="Create Customer"
        visible={isVisible}
      >
        <Form
          labelCol={{
            xs: { span: 24 },
            sm: { span: 8 },
          }}
          wrapperCol={{
            xs: { span: 24 },
            sm: { span: 12 },
          }}
          form={form}
          fields={[
            {
              name: "key",
              value: selectEdit?.key,
            },
            {
              name: "name",
              value: selectEdit?.name,
            },
            {
              name: "age",
              value: selectEdit?.age,
            },
            {
              name: "address",
              value: selectEdit?.address,
            },
            {
              name: "type",
              value: selectEdit?.type,
            },
          ]}
          onFinish={onFinish}
          name="control-hooks"
        >
          <Form.Item hidden={true} name="key" label="key">
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="age" label="Age" rules={[{ required: true }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select style={{ width: "100%" }}>
              {Object.keys(typesCustomer).map((key) => (
                <Select.Option value={key} key={key}>
                  {typesCustomer[key]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default App;
