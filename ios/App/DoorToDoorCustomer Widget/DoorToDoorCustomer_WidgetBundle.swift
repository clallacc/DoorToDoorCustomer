//
//  DoorToDoorCustomer_WidgetBundle.swift
//  DoorToDoorCustomer Widget
//
//  Created by Christian Lalla on 27/09/2024.
//

import WidgetKit
import SwiftUI

@main
struct DoorToDoorCustomer_WidgetBundle: WidgetBundle {
    var body: some Widget {
        DoorToDoorCustomer_Widget()
        DoorToDoorCustomer_WidgetControl()
        DoorToDoorCustomer_WidgetLiveActivity()
    }
}
