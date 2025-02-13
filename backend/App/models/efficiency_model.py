from pymongo import MongoClient


class EfficiencyModel:
    def __init__(self, db):
        """
        Initialize with MongoDB database instance.
        """
        self.source_collection = db["Kokkola"]
        self.target_collection = db["KokkolaEfficiency"]

    def calculate_efficiency(self):
        """
        Fetch data from Kokkola, perform efficiency calculations,
        and save results to KokkolaEfficiency.
        """
        documents = list(self.source_collection.find({}))
        for doc in documents:
            try:
                # Fetch fields from document
                standardiaika = doc.get("Standardiaika", 0)
                total_made = doc.get("Total made", 0)
                weekly_hours = doc.get("Viikon työtunnit", 0)

                # Calculate fields
                vkl_std = (
                    round(float(standardiaika) * float(total_made), 2)
                    if standardiaika and total_made
                    else 0
                )
                efficiency_now = round(vkl_std / weekly_hours, 2) if weekly_hours else 0

                # Prepare document for target collection
                result_doc = {
                    "KEY": doc.get("KEY"),
                    "Item number": doc.get("Item number"),
                    "Standardiaika": standardiaika,
                    "Total made": total_made,
                    "Viikonvalmistuneet kappaleet std": vkl_std,
                    "EFFICIENCY NOW": efficiency_now,
                    "Viikon työtunnit": weekly_hours,
                }

                # Save to target collection
                self.target_collection.replace_one(
                    {"KEY": doc.get("KEY")}, result_doc, upsert=True
                )

            except Exception as e:
                print(f"Error processing document {doc.get('KEY')}: {e}")

        print("Efficiency data processed and saved successfully.")
