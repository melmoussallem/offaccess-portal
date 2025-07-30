# Windows Defender Exclusion for Faster React Dev Server

To speed up your frontend development server on Windows, add your project folder to Windows Defender exclusions:

1. Open Windows Security (search for 'Windows Security' in Start menu).
2. Go to 'Virus & threat protection'.
3. Click 'Manage settings' under 'Virus & threat protection settings'.
4. Scroll down to 'Exclusions' and click 'Add or remove exclusions'.
5. Click 'Add an exclusion' > 'Folder' and select:
   C:\Users\melmo\OneDrive\Desktop\Cursor

This will prevent real-time scanning from slowing down file changes and rebuilds. 