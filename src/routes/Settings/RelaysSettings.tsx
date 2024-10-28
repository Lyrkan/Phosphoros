import { Card, Form } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import CardHeader from "../../components/CardHeader";
import { useSettings } from "../../hooks/useSettings";
import { AlarmBehavior, InterlockBehavior } from "../../types/Settings";

export default observer(function RelaysSettings() {
  const settings = useSettings();

  const alarmFlags = [
    { flag: AlarmBehavior.EnableWhenRunning, label: "Enable when running" },
    { flag: AlarmBehavior.EnableWhenNotIdling, label: "Enable when not idling" },
    { flag: AlarmBehavior.EnableWhenFlameSensorTriggered, label: "Enable when flame sensor triggered" },
    { flag: AlarmBehavior.EnableWhenCoolingIssue, label: "Enable when cooling issue" },
    { flag: AlarmBehavior.EnableWhenLidOpened, label: "Enable when lid opened" }
  ];

  const interlockFlags = [
    { flag: InterlockBehavior.DisableWhenLidOpened, label: "Disable when lid opened" },
    { flag: InterlockBehavior.DisableWhenCoolingIssue, label: "Disable when cooling issue" },
    { flag: InterlockBehavior.DisableWhenFlameSensorTriggered, label: "Disable when flame sensor triggered" }
  ];

  const handleAlarmFlagChange = (flag: AlarmBehavior, checked: boolean) => {
    const currentFlags = settings.relays.alarm_behavior ?? 0;
    const newFlags = checked ? currentFlags | flag : currentFlags & ~flag;
    settings.updateSettings({ relays: { alarm_behavior: newFlags } });
  };

  const handleInterlockFlagChange = (flag: InterlockBehavior, checked: boolean) => {
    const currentFlags = settings.relays.interlock_behavior ?? 0;
    const newFlags = checked ? currentFlags | flag : currentFlags & ~flag;
    settings.updateSettings({ relays: { interlock_behavior: newFlags } });
  };

  return (
    <Card className="border-primary">
      <CardHeader icon="bi-toggles" title="Relays options" />
      <Card.Body>
        <Card.Text as="div">
          <Form>
            <h6 className="mb-3">Alarm Behavior</h6>
            {alarmFlags.map(({ flag, label }) => (
              <Form.Check
                key={flag}
                type="switch"
                label={label}
                checked={Boolean(settings.relays.alarm_behavior && (settings.relays.alarm_behavior & flag))}
                onChange={(e) => handleAlarmFlagChange(flag, e.target.checked)}
                className="mb-2"
              />
            ))}

            <h6 className="mt-4 mb-3">Interlock Behavior</h6>
            {interlockFlags.map(({ flag, label }) => (
              <Form.Check
                key={flag}
                type="switch"
                label={label}
                checked={Boolean(settings.relays.interlock_behavior && (settings.relays.interlock_behavior & flag))}
                onChange={(e) => handleInterlockFlagChange(flag, e.target.checked)}
                className="mb-2"
              />
            ))}
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>
  );
});
