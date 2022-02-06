import "./styles.css";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

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
  const dataHelperText = "paste spreadsheet with\nName, FTP, Phone";
  const [message, setMessage] = useState(
    "Hey it’s Bri Alexander, PWR coach from life time. Great work! Attached is your FTP and power zones. The FTP number is calculated as 95% of the average watts from your 20-minute test. Way to go! Keep up your hard work and I can’t wait to see you at PWR again. Reach out with any questions at all, I am here for you! We are stronger together 🤙🏼"
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

    var nameColumn = FindColumn(["name"], headers);
    var ftpColumn = FindColumn(["ftp"], headers);
    var phoneColumn = FindColumn(["phone", "cell"], headers);

    const p = parsed
      .slice(1)
      .map((row) => {
        const participant = {
          name: row[nameColumn],
          ftp: row[ftpColumn],
          phone: row[phoneColumn]
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

  function GetPhone(participant) {
    if (
      participant.phone &&
      participant.phone.match(/^\+?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,6}$/im)
    ) {
      return (
        <span>
          {" "}
          <a
            href={`sms:+1${encodeURIComponent(
              participant.phone
            )}&body=${encodeURIComponent(message)}`}
          >
            ({participant.phone})
          </a>
        </span>
      );
    }
    return "";
  }

  participants.forEach((participant) => {
    participant.zoneData = CalcZones(participant.ftp);
  });
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
      <div>
        <h1>Results</h1>
        {participants.map((participant, participantIndex) => (
          <div key={`participant-${participantIndex}`} className="participant">
            <div>
              {participant.name}
              {GetPhone(participant)}
            </div>
            <div>FTP: {participant.ftp} watts</div>
            <table>
              <tbody>
                {participant.zoneData.map((zoneData, zoneIndex) => (
                  <tr
                    className={zoneData.zone.className}
                    key={`participant-${participantIndex}-zone-${zoneIndex}`}
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
          </div>
        ))}
      </div>
    </div>
  );
}
