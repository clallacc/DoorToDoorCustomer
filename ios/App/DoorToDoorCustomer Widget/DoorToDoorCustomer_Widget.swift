import SwiftUI
import WidgetKit

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> ProductEntry {
        ProductEntry(date: Date(), product: nil)
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> ProductEntry {
        ProductEntry(date: Date(), product: nil)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<ProductEntry> {
        var entries: [ProductEntry] = []

        // Fetch product data
        let product = await fetchProduct(for: Date())
        
        // Generate a timeline consisting of entries every 7 hours, starting from the current date.
        let currentDate = Date()
        for hourOffset in stride(from: 0, to: 24, by: 7) { // 0, 7, 14, 21
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = ProductEntry(date: entryDate, product: product)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }

    private func fetchProduct(for date: Date) async -> Product? {
        // Define the two URLs
        let url1 = "https://shop.doortodoortt.com/west/wp-json/wc/v3/products?per_page=1&page=1&stock_status=instock&status=publish&customer_key=ck_5ba0dd3b29eeb8f42ae743703e9330597bcc3647&customer_secret=cs_e547581bfaf86c8025086e4e374cd64019702d81"
        let url2 = "https://shop.doortodoortt.com/west/wp-json/wc/v3/products?per_page=1&page=1&featured=true&stock_status=instock&status=publish&customer_key=ck_5ba0dd3b29eeb8f42ae743703e9330597bcc3647&customer_secret=cs_e547581bfaf86c8025086e4e374cd64019702d81"

        // Switch between URLs based on the current hour
        let hour = Calendar.current.component(.hour, from: date)
        let selectedURLString = (hour % 2 == 0) ? url1 : url2 // Alternate based on even/odd hour

        guard let url = URL(string: selectedURLString) else {
            return nil
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        // Create the basic authentication string
        let username = "chris@blucloudonline.com"
        let password = "NtyL 0WcN l4vJ Sh88 e4Ut RroE"
        let loginString = "\(username):\(password)"
        let loginData = loginString.data(using: .utf8)!
        let base64LoginString = loginData.base64EncodedString()
        
        request.setValue("Basic \(base64LoginString)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            let decoder = JSONDecoder()
            // Decode the response as an array of products
            let products = try decoder.decode([Product].self, from: data)
            // Get the first product if available
            return products.first
        } catch {
            print("Error fetching or decoding product: \(error.localizedDescription)")
            return nil
        }
    }
}

struct ProductEntry: TimelineEntry {
    let date: Date
    let product: Product? // Add product to the entry
}

struct DoorToDoorCustomer_WidgetEntryView: View {
    var entry: ProductEntry

    var body: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(Color(red: 0.2, green: 0.51, blue: 0.627).gradient)
                .edgesIgnoringSafeArea(.all)

            VStack {
                if let product = entry.product {
                    // Use AsyncImage to load the image
                    AsyncImage(url: URL(string: product.imageURL)) { image in
                        image.resizable()
                    } placeholder: {
                      Image("dtdlogo").resizable()
                        .scaledToFit()
                    }

                  HStack{
                    Text(product.price)
                      .fontWeight(.bold)
                      .foregroundColor(Color(red: 0.78, green: 0.886, blue: 0.4))
                      .minimumScaleFactor(0.4)
                      .padding(.leading)
                      .padding(.bottom)
                      .multilineTextAlignment(.center)
                    
                    Text(product.name)
                        .font(.system(size: 10))
                        .foregroundColor(.white)
                        .padding(.trailing)
                        .padding(.bottom)
                        .multilineTextAlignment(.leading)
                  }
                } else {
                  Image("dtdlogo").resizable()
                    .scaledToFit()
                }
            }
        }
    }
}

struct Product: Codable {
    let id: Int
    let name: String
    let price: String
    let images: [Image]

    struct Image: Codable {
        let src: String
    }

    var imageURL: String {
        // Replace "https://" with "https://i0.wp.com/"
        let originalURL = images.first?.src ?? ""
        return originalURL.replacingOccurrences(of: "https://", with: "https://i0.wp.com/")
    }
}

struct DoorToDoorCustomer_Widget: Widget {
    let kind: String = "DoorToDoorCustomer_Widget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            DoorToDoorCustomer_WidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .contentMarginsDisabled()
        .configurationDisplayName("Door to Door Widget")
        .description("Quick view of our latest products and specials")
    }
}

#Preview(as: .systemSmall) {
    DoorToDoorCustomer_Widget()
} timeline: {
    ProductEntry(date: .now, product: nil)
}
