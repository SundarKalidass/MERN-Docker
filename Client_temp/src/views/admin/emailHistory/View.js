import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Card from "components/card/Card";
import { HSeparator } from "components/separator/Separator";
import Spinner from "components/spinner/Spinner";
import moment from "moment";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useParams, useNavigate } from "react-router-dom";
import { HasAccess } from "../../../redux/accessUtils";
import { getApi } from "services/api";
import { FaFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { fetchPropertyData } from "../../../redux/slices/propertySlice";
import { fetchPropertyCustomFiled } from "../../../redux/slices/propertyCustomFiledSlice.js";
import CommonCheckTable from "../../../components/reactTable/checktable";
import { useDispatch, useSelector } from "react-redux";

const View = () => {
  const param = useParams();

  const [data, setData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [edit, setEdit] = useState(false);
  const [deleteModel, setDelete] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoding, setIsLoding] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [columns, setColumns] = useState([]);
  const [selectedValues, setSelectedValues] = useState();
  const dispatch = useDispatch();
  const size = "lg";

  const fetchData = async () => {
    setIsLoding(true);
    let response = await getApi("api/email/view/", param.id);
    setData(response?.data);
    setIsLoding(false);
  };

  const fetchCustomDataFields = async () => {
    setIsLoding(true);
    const result = await dispatch(fetchPropertyCustomFiled());
    const tempTableColumns = [
      { Header: "#", accessor: "_id", isSortable: false, width: 10 },
      ...result?.payload?.data?.[0]?.fields
        ?.filter((field) => field?.isTableField === true)
        ?.map((field) => ({ Header: field?.label, accessor: field?.name })),
    ];
    setColumns(tempTableColumns);
    setIsLoding(false);
  };

  useEffect(() => {
    fetchCustomDataFields();
  }, []);

  const generatePDF = () => {
    setLoading(true);
    const element = document.getElementById("reports");
    const hideBtn = document.getElementById("hide-btn");

    if (element) {
      hideBtn.style.display = "none";
      html2pdf()
        .from(element)
        .set({
          margin: [0, 0, 0, 0],
          filename: `Email_Details_${moment().format("DD-MM-YYYY")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save()
        .then(() => {
          setLoading(false);
          hideBtn.style.display = "";
        });
      // }, 500);
    } else {
      console.error("Element with ID 'reports' not found.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [contactAccess, leadAccess, PropertiesAccess] = HasAccess([
    "Contacts",
    "Leads",
    "Properties",
  ]);

  return (
    <>
      {isLoding ? (
        <Flex justifyContent={"center"} alignItems={"center"} width="100%">
          <Spinner />
        </Flex>
      ) : (
        <>
          <Grid templateColumns="repeat(4, 1fr)" gap={3} id="reports">
            <GridItem colSpan={{ base: 4 }}>
              <Heading size="lg" m={3}>
                {data?.senderEmail}
              </Heading>
            </GridItem>
            <GridItem colSpan={{ base: 4 }}>
              <Card>
                <Grid gap={4}>
                  <GridItem colSpan={2}>
                    <Box>
                      <Box display={"flex"} justifyContent={"space-between"}>
                        <Heading size="md" mb={3}>
                          Email Details
                        </Heading>
                        <Box id="hide-btn">
                          <Button
                            leftIcon={<FaFilePdf />}
                            size="sm"
                            variant="brand"
                            onClick={generatePDF}
                            disabled={loading}
                          >
                            {loading ? "Please Wait..." : "Print as PDF"}
                          </Button>
                          <Button
                            leftIcon={<IoIosArrowBack />}
                            size="sm"
                            variant="brand"
                            onClick={() => navigate(-1)}
                            style={{ marginLeft: 10 }}
                          >
                            Back
                          </Button>
                        </Box>
                      </Box>
                      <HSeparator />
                    </Box>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Sender{" "}
                    </Text>
                    <Text>{data?.senderEmail ? data?.senderEmail : " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Recipient{" "}
                    </Text>
                    <Text>{data?.recipient ? data?.recipient : " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Create From{" "}
                    </Text>
                    {data?.createBy ? (
                      <Link to={`/contactView/${data?.createBy}`}>
                        <Text
                          color={
                            contactAccess?.view ? "brand.600" : "blackAlpha.900"
                          }
                          sx={{
                            "&:hover": {
                              color: contactAccess?.view
                                ? "blue.500"
                                : "blackAlpha.900",
                              textDecoration: contactAccess?.view
                                ? "underline"
                                : "none",
                            },
                          }}
                        >
                          {data?.createByName ? data?.createByName : " - "}
                        </Text>
                      </Link>
                    ) : (
                      <Link to={`/leadView/${data?.createByLead}`}>
                        <Text
                          color={
                            leadAccess?.view ? "brand.600" : "blackAlpha.900"
                          }
                          sx={{
                            "&:hover": {
                              color: leadAccess?.view
                                ? "blue.500"
                                : "blackAlpha.900",
                              textDecoration: leadAccess?.view
                                ? "underline"
                                : "none",
                            },
                          }}
                        >
                          {data?.createByName ? data?.createByName : " - "}
                        </Text>
                      </Link>
                    )}
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Realeted To{" "}
                    </Text>
                    <Text>
                      {data?.createBy
                        ? "Contact"
                        : data?.createByLead && "Lead"}
                    </Text>
                  </GridItem>

                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Start Date{" "}
                    </Text>
                    <Text>
                      {" "}
                      {data?.startDate
                        ? moment(data?.startDate).format("lll ")
                        : " - "}{" "}
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      End Date{" "}
                    </Text>
                    <Text>
                      {" "}
                      {data?.endDate
                        ? moment(data?.endDate).format("lll ")
                        : " - "}{" "}
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Time stamp{" "}
                    </Text>
                    <Text>
                      {" "}
                      {data?.timestamp
                        ? moment(data?.timestamp).format("lll ")
                        : " - "}{" "}
                      [
                      {data?.timestamp
                        ? moment(data?.timestamp).toNow()
                        : " - "}
                      ]
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Subject{" "}
                    </Text>
                    <Text>{data?.subject ? data?.subject : " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Sales Agent{" "}
                    </Text>
                    <Text>
                      {data?.salesAgentName ? data?.salesAgentName : " - "}
                    </Text>
                  </GridItem>
                  {/* <GridItem colSpan={{ base: 2 }} >
                                        <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Message </Text>
                                        {
                                            data?.type === "message" ?
                                                <Text>{data?.message ? data?.message : '-'}</Text>
                                                :
                                                <div dangerouslySetInnerHTML={{ __html: data?.html }} />
                                        }
                                    </GridItem> */}
                </Grid>
              </Card>
            </GridItem>
          </Grid>
          
          <Card mt={3}>
            <Grid templateColumns="repeat(6, 1fr)" gap={1}>
              <GridItem colSpan={{ base: 2 }}  style={{ maxWidth: '100%', width: '100%', boxSizing: 'border-box', padding: '0 10px'}}>
                <Text fontSize="sm" fontWeight="bold" color={"blackAlpha.900"}>
                  {" "}
                  Message{" "}
                </Text>
                <pre style={{ whiteSpace: "pre-wrap" , display: 'flex', justifyContent: 'center',alignItems:'center', alignContent:'center' }}>
                  {data?.type === "message" ? (
                    <Text>{data?.message ? data?.message : "-"}</Text>
                  ) : (
                    <div style={{width:'100%',display:'flex',alignContent:'center',alignItems:'center',padding:'50px 50px'}} dangerouslySetInnerHTML={{ __html: data?.html }} />
                  )}
                </pre>
              </GridItem>
            </Grid>
          </Card>
          
          <Grid templateColumns="repeat(2, 1fr)" gap={1} mt={3}>
            <GridItem colSpan={{ base: 2 }}>
              <CommonCheckTable
                title={"Properties"}
                isLoding={isLoding}
                columnData={columns ?? []}
                allData={data?.properties ?? []}
                tableData={data?.properties ?? []}
                AdvanceSearch={false}
                tableCustomFields={
                  data?.properties?.[0]?.fields?.filter(
                    (field) => field?.isTableField === true
                  ) || []
                }
                addBtn={false}
                ManageGrid={false}
                deleteMany={false}
                checkBox={false}
                access={PropertiesAccess}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
              />
            </GridItem>
          </Grid>


        </>
      )}
    </>
  );
};

export default View;
