# Launch VS Code with ps-site-slicer workspace and open kl0wd in terminal
$codePath = "C:\Users\User\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd"
$workspace = "C:\Users\User\projects\powerslice\ps-site-slicer\ps-site-slicer.code-workspace"

# Open VS Code with the workspace
& $codePath $workspace

# Wait for VS Code to fully load
Start-Sleep -Seconds 5

# Open a new terminal in VS Code (reuse the window)
& $codePath -r --command "workbench.action.terminal.new"

# Wait for terminal to initialize
Start-Sleep -Seconds 2

# Bring VS Code to foreground and send kl0wd command
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinAPI {
    [DllImport("user32.dll")]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

# Find and focus VS Code window
$vscodeProc = Get-Process -Name "Code" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($vscodeProc -and $vscodeProc.MainWindowHandle -ne [IntPtr]::Zero) {
    [WinAPI]::ShowWindow($vscodeProc.MainWindowHandle, 9) | Out-Null  # SW_RESTORE
    [WinAPI]::SetForegroundWindow($vscodeProc.MainWindowHandle) | Out-Null
}

Start-Sleep -Milliseconds 500

# Type kl0wd and press Enter in the terminal
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait("kl0wd{ENTER}")
