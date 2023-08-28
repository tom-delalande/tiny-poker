import requests
import sqlite3

con = sqlite3.connect("./server/db/database.sqlite3")
cur = con.cursor()
res = cur.execute("SELECT COUNT(DISTINCT(device_id)) FROM event_logs;")
uniqueDevicesAllTime = res.fetchone()[0]

res = cur.execute("SELECT COUNT(DISTINCT(session_id)) FROM event_logs WHERE timestamp > datetime('now', '-24 hour');")
uniqueSessionsLast24hours = res.fetchone()[0]

r = requests.post(
        'https://discord.com/api/webhooks/1145677918639505489/ffcpzU3ZUeNwxhFYLd7HI6bTHSaNlXG29vcBek6V4m0CeFLT4m56H5e1hg1BrlfOH045',
         json={
             "username": "Daily Update",
             "content": f'''
Unique devices of all time: {uniqueDevicesAllTime}
Unique sessions in last 24 hours: {uniqueSessionsLast24hours}
''',
             }
          )

print(f"Status Code: {r.status_code}")
