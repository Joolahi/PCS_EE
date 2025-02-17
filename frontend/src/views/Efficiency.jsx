import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  Typography,
  TextField,
  Button,
  Container,
  Box,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Modal
} from "@mui/material";
import axios from "axios";
import API_URL from "../api/config";
import { useTranslation } from "react-i18next";

const Efficiency = () => {
  const { user } = useContext(AuthContext);
  const [weeklyHours, setWeeklyHours] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [tableData, setTableData] = useState([]);
  const [mainSummary, setMainSummary] = useState({});
  const [rowColors, setRowColors] = useState({}); // State to store row colors
  const [osastoFilters, setOsastoFilters] = useState(["300", "400"]);
  const [warningModal, setWarningModal] = useState(false);
  

  const { t } = useTranslation();

  const sanitizeNumber = (value) => {
    return value && !isNaN(value) ? parseInt(value, 10) : 0;
  };

  // Fetch Efficiency Summary
  const fetchEfficiencySummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/efficiency`);
      if (response.status === 200) {
        console.log(response.data);
        const responseData = response.data;
        //sorting the response data by jononumero
        responseData.items.sort((a, b) => a["Jononumero"] - b["Jononumero"]);
        setTableData(responseData);
        setMainSummary({
          "Viikon työtunnit": response.data.viikon_tyotunnit,
          "EFFICIENCY TARGET": response.data["EFFICIENCY TARGET"],
          "Viikon valmistuneet kappaleet tavoite":
            response.data.total_kpl_target_ajalla,
          "EFFICIENCY NOW": response.data["EFFICIENCY NOW"],
          "Total made sum": response.data.total_kpl_std_ajalla,
        });
      }
    } catch (error) {
      setSnackbarMessage("Error fetching efficiency data");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  // Add Weekly Hours
  const handleAddWeeklyHours = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/efficiency`, {
        weekly_hours: parseInt(weeklyHours),
      });
      if (response.status === 200) {
        setSnackbarMessage("Weekly hours updated successfully");
        setSnackbarSeverity("success");
        fetchEfficiencySummary();
      }
    } catch (error) {
      setSnackbarMessage("Error updating weekly hours");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleOsastoFilterChange = (osasto) => {
    setOsastoFilters((prev) =>
      prev.includes(osasto)
        ? prev.filter((item) => item !== osasto) // Remove if already included
        : [...prev, osasto] // Add if not included
    );
  };

    // Calculate Totals
    const calculateTotal = (key) => {
      return tableData.items
        ? tableData.items.reduce((sum, item) => sum + sanitizeNumber(item[key]), 0)
        : 0;
    };

    const handleWarningModal = () => {
      setWarningModal(true);
    }

    const handleEfficiencySave = () => {
      setLoading(true)
      try{
        const response = axios.post(`${API_URL}/api/efficiencySave`)
        if (response.status === 200) {
          setSnackbarMessage("Efficiency data saved successfully");
          setSnackbarSeverity("success");
        }
      } catch (error) {
        setSnackbarMessage("Error saving efficiency data");
        setSnackbarSeverity("error");
      } finally {
        setLoading(false);
      }
    }
    const handleStatusChange = async (itemId, newStatus) => {
      setLoading(true);
      const summaryId = tableData._id;
      const payload = {
        summaryId,
        itemId,
        newStatus,
      }
      try {
        console.log({ summaryId, itemId, newStatus });
        const response = await axios.post(`${API_URL}/api/efficiencyStatus`, payload);
        if (response.status === 200) {
          setSnackbarMessage("Status updated successfully");
          setSnackbarSeverity("success");
          fetchEfficiencySummary(); // Refresh the data
        }
      } catch (error) {
        setSnackbarMessage("Error updating status");
        setSnackbarSeverity("error");
      } finally {
        setLoading(false);
      }
    };
  
    const getStatusColor = (status) => {
      switch (status) {
        case "Ready":
          return "rgb(99, 255, 106, 0.8)";
        case "Maybe":
          return "rgb(255, 255, 46, 0.8)";
        case "Not Ready":
          return "rgb(255, 99, 99, 0.8)";
        default:
          return "white";
      }
    };
  
    const roundToTwoDecimals = (value) => {
      typeof value === "number" ? value.toFixed(2) : value;
    } 

  useEffect(() => {
    fetchEfficiencySummary();
  }, []);

    const handleRowStatus = (rowIndex) => {
      const total_made = tableData.items[rowIndex].total_made;
      const target = tableData.items[rowIndex].Quantity;
      if (total_made === target) {
        return "rgb(99, 255, 106, 0.8)";
      }
      if (total_made < target && total_made > 0 && total_made !== "-") {
        return "rgb(255, 255, 46, 0.8)";
      }
      return "white";
    }

    return (
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          paddingY: 1,
          borderRadius: 2,
          height: "100%",
          width: "100%",
        }}
      >
        {/* Page Title */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: "#071952",
            fontWeight: "bold",
            textAlign: "left",
          }}
        >
          {t("Efficiency Summary")}
        </Typography>
    
      {/* Main Summary */}
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "space-between" }}>
        {[
          "EFFICIENCY NOW",
          "Total made sum",
          "Total Quantity",
          "Total Made",
          ...(user
            ? [
                "Viikon työtunnit",
                "EFFICIENCY TARGET",
                "Viikon valmistuneet kappaleet tavoite",
              ]
            : []),
        ].map((key, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              padding: 1,
              flex: 1,
              minWidth: "180px",
              backgroundColor: "#e3f2fd",
              textAlign: "center",
              borderRadius: 2,
              "&:hover": { boxShadow: 6 },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "#444", fontWeight: "bold" }}
            >
              {t(key)}
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "#071952", fontWeight: "bold" }}
            >
              {key === "Total Quantity"
                ? calculateTotal("Quantity")
                : key === "Total Made"
                ? calculateTotal("total_made")
                : mainSummary[key] !== undefined
                ? typeof mainSummary[key] === "number"
                ? mainSummary[key].toFixed(2) // Round to 2 decimals
                : mainSummary[key]
              : "-"}
            </Typography>
          </Paper>
        ))}
      </Box>
    
        {/* Weekly Hours Input (Visible Only If User is Logged In) */}
        {user && (
          <>
            <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginY: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: "bold",color: "#071952" }}>
              {t("Filter by Osasto")}:
            </Typography>
            <Box>
              <label style={{ color: "#071952" }}>
                <input
                  type="checkbox"
                  checked={osastoFilters.includes("300")}
                  onChange={() => handleOsastoFilterChange("300")}
                />
                Osasto 300
              </label>
              <label style={{ color: "#071952", marginLeft: 10 }}>
                <input
                  type="checkbox"
                  checked={osastoFilters.includes("400")}
                  onChange={() => handleOsastoFilterChange("400")}
                />
                Osasto 400
              </label>
              <Button
                variant="contained"
                size="small"
                onClick={handleWarningModal}
                disabled={loading}
                sx={{ fontWeight: "bold", marginLeft:3}}
              >
                {t('Save')}
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginY: 1,
            }}
          >
            <TextField
              type="number"
              label={t("Viikontyötunnit")}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 1,
              }}
            />
            <Button
              variant="contained"
              size="medium"
              onClick={handleAddWeeklyHours}
              disabled={loading}
              sx={{ fontWeight: "bold" }}
            >
              {loading ? <CircularProgress size={20} /> : t("Add Weekly Hours")}
            </Button>
          </Box>
          </>
        )}
    
        {/* Efficiency Table */}
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            borderRadius: 2,
            maxHeight: "calc(100vh - 275px)",
            minWidth: "100%",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "VKO",
                  "Osasto",
                  "Jononumero",
                  "Item number",
                  "Sales order",
                  "TARGET PCS/H",
                  "Deliver remainder",
                  "Quantity",
                  "Total made",
                  ...user ? [
                  "Category"] : [],
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#e3f2fd",
                      color: "#071952",
                      
                    }}
                  >
                    {t(header)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.items &&
              Array.isArray(tableData.items) &&
              tableData.items.length > 0 ? (
                tableData.items
                .filter((item) => osastoFilters.includes(String(item.Osasto)))
                .map((item, itemIndex) => (
                  <TableRow key={itemIndex} sx={{ backgroundColor: handleRowStatus(itemIndex), "& td": {padding: "1px 8px"}  }}>
                    <TableCell >{item.VKO || "-"}</TableCell>
                    <TableCell>{item.Osasto || "-"}</TableCell>
                    <TableCell>{item["Jononumero"] || "-"}</TableCell>
                    <TableCell sx={{fontWeight: "bolder"}}>{item["Item number"] || "-"}</TableCell>
                    <TableCell>{item["Sales order"] || "-"}</TableCell>
                    <TableCell>{item["KPL STD ajalla TARGET"] || "-"}</TableCell>
                    <TableCell sx={{color: "#115399", fontWeight: "bold"}}>{item["Deliver remainder"] || "-"}</TableCell>
                    <TableCell sx={{fontWeight: "bolder"}}>{item.Quantity || "-"}</TableCell>
                    <TableCell sx={{fontWeight: "bolder"}}>{item.total_made || "-"}</TableCell>
                    { user && (
                      <>                
                    <TableCell>{item.Category || "-"}</TableCell>
                    <TableCell sx={{ backgroundColor: getStatusColor(item["Status"]|| "")}}>
                      <Select value={item.Status || ""} onChange={(e) => handleStatusChange(item._id, e.target.value)} fullWidth size="small">
                        <MenuItem value="Ready">Ready</MenuItem>
                        <MenuItem value="Maybe">Maybe</MenuItem>
                        <MenuItem value="Not Ready">Not Ready</MenuItem>
                        <MenuItem value="">None</MenuItem>
                      </Select>
                    </TableCell>
                    </>    
                  )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {t("No items available")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
    
        {/* Snackbar for Feedback */}
        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={4000}
          onClose={() => setSnackbarMessage(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
        </Snackbar>
              
                    
        {/* Warning Modal */}
        <Modal
            open={warningModal}
            onClose={() => setWarningModal(false)}
            aria-labelledby="warning-modal-title"
            aria-describedby="warning-modal-description"
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 300,
                bgcolor: 'background.paper',
                border: '3px solid #c10505',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}
            >
              <Typography id="warning-modal-title" variant="h6" component="h2" color="black">
                {t('Warning')}
              </Typography>
              <Typography id="warning-modal-description" sx={{ mt: 2 }} color="black">
                {t('Are you sure you want to save the changes?')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleEfficiencySave();
                    setWarningModal(false);
                  }}
                >
                  {t('Confirm')}
                </Button>
                <Button variant="outlined" onClick={() => setWarningModal(false)}>
                  {t('Cancel')}
                </Button>
              </Box>
            </Box>
          </Modal>
      </Container>
    );
};

export default Efficiency;