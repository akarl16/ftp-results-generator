import "./styles.css";
import React, { useState } from "react";
import { Fragment } from "react";
import { Card, CardContent, Button, Box, Stack, TextField, Typography } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import domtoimage from "dom-to-image";

export default function App() {
  const zones = [
    {
      zoneName: "Zone 1",
      minPct: 0,
      maxPct: 55,
      className: "ftp-zone1"
    },
    {
      zoneName: "Zone 2",
      minPct: 55,
      maxPct: 75,
      className: "ftp-zone2"
    },
    {
      zoneName: "Zone 3",
      minPct: 75,
      maxPct: 95,
      className: "ftp-zone3"
    },
    {
      zoneName: "Zone 4",
      minPct: 95,
      maxPct: 105,
      className: "ftp-zone4"
    },
    {
      zoneName: "Zone 5",
      minPct: 105,
      maxPct: 120,
      className: "ftp-zone5"
    }
  ];

  const [participants, setParticipants] = useState([]);
  const dataHelperText = "paste spreadsheet with\nName, FTP, Email, Phone";
  const [message, setMessage] = useState(
    "Hey it’s Adam Karl, PWR coach from Life Time. Great work! Attached is your FTP and power zones. The FTP number is calculated as 95% of the average watts from your 20-minute test. Way to go! Keep up your hard work and I can’t wait to see you at PWR again. Here is some additional explanation of the power zones we use but please reach out with any questions, I am here for you!\n\nhttps://www.trainingpeaks.com/blog/power-training-levels/\n\nWe are stronger together 🤙🏼"
  );

  function CalcZones(ftp_value) {
    return zones.map((zone) => ({
      zone: zone,
      minWatts: Math.round(zone.minPct * 0.01 * ftp_value),
      maxWatts: Math.round(zone.maxPct * 0.01 * ftp_value)
    }));
  }

  function FindColumn(searchTerms, headers) {
    if (!headers || !Array.isArray(headers)) {
      throw new Error("Invalid headers array");
    }
    const lowerHeaders = headers.map((header) => header.toLowerCase().trim());
    console.debug(lowerHeaders);
    var foundIndex = undefined;
    searchTerms.some((searchTerm) => {
      foundIndex = lowerHeaders.indexOf(searchTerm);
      return foundIndex > 0;
    });
    return foundIndex;
  }

  function HandlePaste(e) {
    const clipboardData = e.clipboardData.getData("text/plain");
    var parsed = clipboardData
      .trim()
      .split(/\r\n|\n|\r/)
      .map((row) => row.split("\t"));
    console.debug("PARSED");
    console.debug(parsed);
    if (!parsed || !Array.isArray(parsed) || parsed.length <= 0) return false;
    const headers = parsed[0];

    const nameColumn = FindColumn(["name"], headers);
    const ftpColumn = FindColumn(["ftp"], headers);
    const phoneColumn = FindColumn(["phone", "cell"], headers);
    const emailColumn = FindColumn(["email"], headers);

    const p = parsed
      .slice(1)
      .map((row, index) => {
        const participant = {
          name: row[nameColumn],
          ftp: row[ftpColumn],
          phone: row[phoneColumn],
          email: row[emailColumn],
          zoneData: CalcZones(row[ftpColumn]),
          participantIndex: index
        };
        console.debug(participant);
        return participant;
      })
      .filter((participant) => {
        return participant.ftp && participant.name;
      });
    setParticipants(p);

    return false;
  }

  async function EmailAndClipClick(participant) {
    if (!participant) return;
    let imageBlob = await domtoimage.toBlob(
      document.getElementById(`participant-${participant.participantIndex}`),
      {
        bgcolor: "white",
        filter: (node) => {
          return !node.classList || !node.classList.contains("clipButton");
        }
      }
    );

    //Put the image on the clipboard
    let clipboardItems = [];
    clipboardItems.push(new window.ClipboardItem({
      [imageBlob.type]: imageBlob
    }));
    await navigator.clipboard.write(clipboardItems);

    //Put the email text on the clipboard
    // clipboardItems = [];
    // clipboardItems.push(new window.ClipboardItem({
    //   "text/html": new Blob([message], {type: 'text/html'})
    // }));
    
    // await navigator.clipboard.write(clipboardItems);

    //Create a virtual link and click it
    let mail = document.createElement("a");
    let emailBody = encodeURIComponent(`${message}\n\n\n`)
    mail.href = `mailto:${participant.email}?subject=PWR Cycling Zones&body=${emailBody}`;
    mail.target = "_new";
    mail.click();
  }

  function RenderPhone(participant) {
    if (
      participant.phone &&
      participant.phone.match(/^\+?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,6}$/im)
    ) {
      const encodedPhone = encodeURIComponent(participant.phone);
      return (
        <Typography className="phoneLink">
          <a href={`sms:+1${encodedPhone}`}>({participant.phone})</a>
        </Typography>
      );
    }
    return "";
  }

  function RenderEmail(participant) {
    if (
      participant.email &&
      participant.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
    ) {
      return (
        <Typography>
          <a href={`mailto:${participant.email}`}>({participant.email})</a>
        </Typography>
      );
    }
    return "";
  }

  function RenderParticipant(participant) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
        <div className="renderedMessage">{message}</div>
        <div>
          {RenderPhone(participant)}
          {RenderEmail(participant)}
        </div>
        <div>
          <Button
            variant="outlined"
            onClick={async () => await EmailAndClipClick(participant)}
            className="clipButton">
            Email & Clip
          </Button>
        </div>
        <div
          key={`participant-${participant.participantIndex}`}
          className="participant"
          id={`participant-${participant.participantIndex}`}
        >
          <Card variant="outlined">
            <Typography variant="h5" component="div" className="renderedFtp">FTP: {participant.ftp} watts</Typography>
            <table>
              <tbody>
                {participant.zoneData.map((zoneData, zoneIndex) => (
                  <tr
                    className={zoneData.zone.className}
                    key={`participant-${participant.participantIndex}-zone-${zoneIndex}`}
                  >
                    <td>{zoneData.zone.zoneName}</td>
                    <td>
                      {zoneData.zone.minPct}% - {zoneData.zone.maxPct}%
                    </td>
                    <td className="ftp-zone-bar">
                      <div className="minFtp">{`${zoneData.minWatts}w`}</div>
                      <div className="maxFtp">{`${zoneData.maxWatts}w`}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <CardContent>
              <Typography variant="h5" component="div" className="participantName">{participant.name}</Typography>
            </CardContent>
          </Card>
        </div>
      </Stack>
    );
  }

  console.debug(`participants`);
  console.debug(participants);

  return (
    <div className="App">
      <div>
        <Box component="form" noValidate>
          <TextField
            label="Message"
            defaultValue={message}
            multiline
            fullWidth
            margin="dense"
          />
          <TextField
            label="Test Data"
            multiline
            fullWidth
            maxRows={4}
            helperText={dataHelperText}
            onPaste={HandlePaste}
            margin="dense"
          />
        </Box>
      </div>
      <Carousel autoPlay={false} navButtonsAlwaysVisible={true} indicators={false} sx={{ maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
        {participants.map((participant) => RenderParticipant(participant))}
      </Carousel>
    </div>
  );
}
