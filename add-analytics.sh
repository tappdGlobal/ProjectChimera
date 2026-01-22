#!/bin/bash

# Script to add basic analytics to remaining screens

# Array of screens to update (filename without path)
screens=(
  "NotificationsScreen.tsx"
  "HostScreen.tsx"
  "EventDiscoveryScreen.tsx"
  "ExploreAllScreen.tsx"
  "DraftsScreen.tsx"
  "DraftEventsScreen.tsx"
  "PublishedEventsScreen.tsx"
  "ReconnectScreen.tsx"
  "ChatSettingsScreen.tsx"
  "EditProfileScreen.tsx"
  "EventDetailsScreen.tsx"
  "SplashScreen.tsx"
)

SCREENS_DIR="/Users/amitverma/Downloads/tapped/ProjectChimera/src/screens"

for screen in "${screens[@]}"; do
  filepath="$SCREENS_DIR/$screen"
  
  if [ -f "$filepath" ]; then
    # Extract screen name (without .tsx)
    screen_name="${screen%.tsx}"
    
    echo "Adding analytics to $screen_name..."
    
    # Check if useAnalytics is already imported
    if ! grep -q "useAnalytics" "$filepath"; then
      # Add import after the first import statement (simplified approach)
      sed -i '' "1a\\
import { useAnalytics } from \"../hooks/useAnalytics\";
" "$filepath"
      
      echo "✓ Added import to $screen_name"
    else
      echo "⊘ $screen_name already has analytics"
    fi
  else
    echo "✗ File not found: $filepath"
  fi
done

echo "Done!"
