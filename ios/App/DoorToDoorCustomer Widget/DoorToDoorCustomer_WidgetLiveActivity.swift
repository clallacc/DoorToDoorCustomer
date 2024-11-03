//
//  DoorToDoorCustomer_WidgetLiveActivity.swift
//  DoorToDoorCustomer Widget
//
//  Created by Christian Lalla on 27/09/2024.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct DoorToDoorCustomer_WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct DoorToDoorCustomer_WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DoorToDoorCustomer_WidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension DoorToDoorCustomer_WidgetAttributes {
    fileprivate static var preview: DoorToDoorCustomer_WidgetAttributes {
        DoorToDoorCustomer_WidgetAttributes(name: "World")
    }
}

extension DoorToDoorCustomer_WidgetAttributes.ContentState {
    fileprivate static var smiley: DoorToDoorCustomer_WidgetAttributes.ContentState {
        DoorToDoorCustomer_WidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: DoorToDoorCustomer_WidgetAttributes.ContentState {
         DoorToDoorCustomer_WidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: DoorToDoorCustomer_WidgetAttributes.preview) {
   DoorToDoorCustomer_WidgetLiveActivity()
} contentStates: {
    DoorToDoorCustomer_WidgetAttributes.ContentState.smiley
    DoorToDoorCustomer_WidgetAttributes.ContentState.starEyes
}
